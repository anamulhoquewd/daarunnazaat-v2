"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoiceKeys } from "@/modules/invoice/hooks";
import type { ICreateAdjustment } from "./validation";

const BASE = "/api/v1/adjustments";

export const adjustmentKeys = {
  all: ["adjustments"] as const,
  lists: () => [...adjustmentKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...adjustmentKeys.lists(), params] as const,
};

export function useAdjustments(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: adjustmentKeys.list(params),
    queryFn: async () => {
      const { data } = await axios.get(BASE, { params });
      return data;
    },
    enabled: Object.keys(params).some((k) => Boolean(params[k])),
  });
}

export function useCreateAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ICreateAdjustment) => axios.post(BASE, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adjustmentKeys.lists() });
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useVoidAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      axios.delete(`${BASE}/${id}`, { data: { reason } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adjustmentKeys.lists() });
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}
