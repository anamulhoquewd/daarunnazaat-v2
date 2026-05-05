"use client";

import axios from "axios";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ICreateSession, IUpdateSession } from "./validation";

const BASE = "/api/v1/sessions";

// ── Query key factory ─────────────────────────────────────────────────────────

export const sessionKeys = {
  all: ["sessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...sessionKeys.lists(), params] as const,
  detail: (id: string) => [...sessionKeys.all, "detail", id] as const,
  periods: (id: string) => [...sessionKeys.all, "periods", id] as const,
};

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchSessions(params: Record<string, unknown>) {
  const { data } = await axios.get(BASE, { params });
  return data;
}

async function fetchSession(id: string) {
  const { data } = await axios.get(`${BASE}/${id}`);
  return data;
}

async function fetchPeriods(id: string) {
  const { data } = await axios.get(`${BASE}/${id}/periods`);
  return data;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useSessions(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: sessionKeys.list(params),
    queryFn: () => fetchSessions(params),
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => fetchSession(id),
    enabled: Boolean(id),
  });
}

export function useSessionPeriods(id: string) {
  return useQuery({
    queryKey: sessionKeys.periods(id),
    queryFn: () => fetchPeriods(id),
    enabled: Boolean(id),
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ICreateSession) => axios.post(BASE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.lists() }),
  });
}

export function useUpdateSession(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: IUpdateSession) => axios.patch(`${BASE}/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
  });
}

export function useActivateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => axios.post(`${BASE}/${id}/activate`),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.lists() }),
  });
}

export function useDeactivateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => axios.post(`${BASE}/${id}/deactivate`),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.lists() }),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      axios.delete(`${BASE}/${id}`, { data: { reason } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.lists() }),
  });
}
