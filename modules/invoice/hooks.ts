"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ICreateInvoice, IBulkGenerateInvoices } from "./validation";

const BASE = "/api/v1/invoices";

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...invoiceKeys.lists(), params] as const,
  detail: (id: string) => [...invoiceKeys.all, "detail", id] as const,
};

async function fetchInvoices(params: Record<string, unknown>) {
  const { data } = await axios.get(BASE, { params });
  return data;
}

async function fetchInvoice(id: string) {
  const { data } = await axios.get(`${BASE}/${id}`);
  return data;
}

export function useInvoices(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => fetchInvoices(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => fetchInvoice(id),
    enabled: Boolean(id),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ICreateInvoice) => axios.post(BASE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.lists() }),
  });
}

export function useGenerateMonthlyInvoices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: IBulkGenerateInvoices) =>
      axios.post(`${BASE}/generate-monthly`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.lists() }),
  });
}

export function useVoidInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      axios.post(`${BASE}/${id}/void`, { reason }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: invoiceKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}
