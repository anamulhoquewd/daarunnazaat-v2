"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const BASE = "/api/v1/reports";

export const reportKeys = {
  dailyCollection: (params: Record<string, unknown>) =>
    ["reports", "daily-collection", params] as const,
  feeStatus: (params: Record<string, unknown>) =>
    ["reports", "fee-status", params] as const,
  outstanding: (params: Record<string, unknown>) =>
    ["reports", "outstanding", params] as const,
  pl: (params: Record<string, unknown>) =>
    ["reports", "income-expense", params] as const,
};

export function useDailyCollectionReport(params: { date?: string; branch?: string }) {
  return useQuery({
    queryKey: reportKeys.dailyCollection(params),
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/daily-collection`, { params });
      return data;
    },
    enabled: Boolean(params.date),
  });
}

export function useFeeStatusReport(params: {
  periodYear?: number;
  periodMonth?: number;
  branch?: string;
  classId?: string;
  onlyDue?: boolean;
}) {
  return useQuery({
    queryKey: reportKeys.feeStatus(params),
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/fee-status`, { params });
      return data;
    },
    enabled: Boolean(params.periodYear && params.periodMonth),
  });
}

export function useOutstandingReport(params: { branch?: string; asOfDate?: string }) {
  return useQuery({
    queryKey: reportKeys.outstanding(params),
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/outstanding`, { params });
      return data;
    },
  });
}

export function usePLReport(params: {
  periodYear?: number;
  periodMonth?: number;
  branch?: string;
}) {
  return useQuery({
    queryKey: reportKeys.pl(params),
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/income-expense`, { params });
      return data;
    },
    enabled: Boolean(params.periodYear && params.periodMonth),
  });
}
