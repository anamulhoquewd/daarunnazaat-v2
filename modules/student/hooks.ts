"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IChangeFee, ICreateStudent, IUpdateStudent } from "./validation";

const BASE = "/api/v1/students";

export const studentKeys = {
  all: ["students"] as const,
  lists: () => [...studentKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...studentKeys.lists(), params] as const,
  detail: (id: string) => [...studentKeys.all, "detail", id] as const,
};

async function fetchStudents(params: Record<string, unknown>) {
  const { data } = await axios.get(BASE, { params });
  return data;
}

async function fetchStudent(id: string) {
  const { data } = await axios.get(`${BASE}/${id}`);
  return data;
}

export function useStudents(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => fetchStudents(params),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => fetchStudent(id),
    enabled: Boolean(id),
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ICreateStudent) => axios.post(BASE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.lists() }),
  });
}

export function useUpdateStudent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: IUpdateStudent) => axios.patch(`${BASE}/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

export function useChangeFee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: IChangeFee) => axios.patch(`${BASE}/${id}/fee`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      axios.delete(`${BASE}/${id}`, { data: { reason } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.lists() }),
  });
}

export function useRestoreStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => axios.post(`${BASE}/${id}/restore`),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.lists() }),
  });
}
