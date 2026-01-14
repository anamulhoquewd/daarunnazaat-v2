"use client";

import { StudentFilters } from "@/types/students";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export function useStudents() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  // Build query params from URL search params
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });
    return params.toString();
  }, [searchParams]);

  // Update filters and URL params
  const updateFilters = useCallback(
    (filters: Partial<StudentFilters>) => {
      const params = new URLSearchParams(searchParams);

      // Update or remove each filter
      Object.entries(filters).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else if (typeof value === "boolean") {
          params.set(key, String(value));
        } else {
          params.set(key, String(value));
        }
      });

      // Reset to page 1 when filters change (except for page param itself)
      if (!Object.keys(filters).includes("page")) {
        params.set("page", "1");
      }

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Helper to set page
  const setPage = useCallback(
    (page: number) => {
      updateFilters({ page });
    },
    [updateFilters]
  );

  // Helper to set sort
  const setSort = useCallback(
    (sortBy: string, sortType: "asc" | "desc") => {
      updateFilters({ sortBy, sortType, page: 1 });
    },
    [updateFilters]
  );

  // Helper to reset all filters
  const resetFilters = useCallback(() => {
    router.push("?page=1", { scroll: false });
  }, [router]);

  return {
    loading,
    error,
    pagination,
    updateFilters,
    setPage,
    setSort,
    resetFilters,
  };
}
