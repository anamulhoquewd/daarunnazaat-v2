"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BASE = "/api/v1/salary-v5";

export const salaryV5Keys = {
  all: ["salary-v5"] as const,
  lists: () => [...salaryV5Keys.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...salaryV5Keys.lists(), params] as const,
  detail: (id: string) => [...salaryV5Keys.all, "detail", id] as const,
};

async function fetchSalaries(params: Record<string, unknown>) {
  const { data } = await axios.get(BASE, { params });
  return data;
}

export function useSalariesV5(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: salaryV5Keys.list(params),
    queryFn: () => fetchSalaries(params),
  });
}

export function useSalaryV5(id: string) {
  return useQuery({
    queryKey: salaryV5Keys.detail(id),
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateSalaryV5() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => axios.post(BASE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryV5Keys.lists() }),
  });
}

export function useBulkGenerateSalaries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { periodYear: number; periodMonth: number; branch?: string }) =>
      axios.post(`${BASE}/bulk-generate`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryV5Keys.lists() }),
  });
}

export function usePayoutSalary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        paymentMethod: string;
        paymentDate?: string;
        bonus?: number;
        deduction?: number;
        notes?: string;
      };
    }) => axios.post(`${BASE}/${id}/payout`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salaryV5Keys.lists() });
    },
  });
}
