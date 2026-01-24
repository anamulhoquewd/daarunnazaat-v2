"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";
import LoadingPage from "../common/loading";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { fetchMe, loading } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return <>{children}</>;
};
