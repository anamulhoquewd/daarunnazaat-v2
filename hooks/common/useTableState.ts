"use client";

import { useState, useCallback } from "react";

export interface TableState {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  filters: Record<string, any>;
}

export const useTableState = () => {
  const [state, setState] = useState<TableState>({
    page: 1,
    pageSize: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    filters: {},
  });

  const setPage = useCallback(
    (page: number) => setState((s) => ({ ...s, page })),
    []
  );

  const setPageSize = useCallback(
    (pageSize: number) => setState((s) => ({ ...s, pageSize, page: 1 })),
    []
  );

  const setSearch = useCallback(
    (search: string) => setState((s) => ({ ...s, search, page: 1 })),
    []
  );

  const setSort = useCallback(
    (sortBy: string) =>
      setState((s) => ({
        ...s,
        sortBy,
        sortOrder:
          s.sortBy === sortBy && s.sortOrder === "asc" ? "desc" : "asc",
        page: 1,
      })),
    []
  );

  const setFilters = useCallback(
    (filters: Record<string, any>) =>
      setState((s) => ({ ...s, filters, page: 1 })),
    []
  );

  const reset = useCallback(
    () =>
      setState({
        page: 1,
        pageSize: 10,
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        filters: {},
      }),
    []
  );

  return {
    state,
    setPage,
    setPageSize,
    setSearch,
    setSort,
    setFilters,
    reset,
  };
};
