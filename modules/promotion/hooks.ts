"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = "/api/v1/promotions";

export function usePromoteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      studentId: string;
      toClassId: string;
      toSessionId: string;
      action: "promoted" | "repeated" | "graduated" | "dropped";
      note?: string;
      generateAdmissionInvoice?: boolean;
    }) => axios.post(`${BASE}/promote`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

export function useBulkPromote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      fromSessionId: string;
      fromClassId: string;
      toClassId: string;
      toSessionId: string;
      studentIds: string[];
      action?: "promoted" | "repeated" | "graduated" | "dropped";
      generateAdmissionInvoice?: boolean;
    }) => axios.post(`${BASE}/bulk`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["enrollments"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
