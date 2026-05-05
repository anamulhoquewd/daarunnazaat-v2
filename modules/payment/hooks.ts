"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoiceKeys } from "@/modules/invoice/hooks";
import type { ICreatePayment } from "./validation";

const BASE = "/api/v1/payments";

export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...paymentKeys.lists(), params] as const,
  detail: (id: string) => [...paymentKeys.all, "detail", id] as const,
};

async function fetchPayments(params: Record<string, unknown>) {
  const { data } = await axios.get(BASE, { params });
  return data;
}

async function fetchPayment(id: string) {
  const { data } = await axios.get(`${BASE}/${id}`);
  return data;
}

export function usePayments(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => fetchPayments(params),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => fetchPayment(id),
    enabled: Boolean(id),
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ICreatePayment) => axios.post(BASE, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.lists() });
      // Payments affect invoice status — invalidate invoices too
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      axios.delete(`${BASE}/${id}`, { data: { reason } }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: paymentKeys.lists() });
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}
