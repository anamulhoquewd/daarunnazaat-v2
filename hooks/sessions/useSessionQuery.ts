import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import { IPagination, SessionCycleType } from "@/validations";
import type {
  ICreateSession,
  IUpdateSession,
} from "@/modules/session/validation";
import { createSessionZ } from "@/modules/session/validation";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../common/useDebounce";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface IFilter {
  isActive: "all" | boolean;
  sortOrder?: sortOrder;
  sortWith?: "createdAt" | "updatedAt" | "name" | "startDate";
  cycleType: "all" | SessionCycleType;
  limit?: string;
}

interface ISearch {
  global: string;
}

type sortOrder = "asc" | "desc";

function useSessionQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [values, setValues] = useState<any | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({ global: "" });
  const [filterWith, setfilterWith] = useState<IFilter>({
    isActive: "all",
    sortWith: "startDate",
    sortOrder: "desc",
    cycleType: "all",
    limit: "10",
  });
  const [isDelOpen, setIsDelOpen] = useState<boolean>(false);

  const form = useForm<z.output<typeof createSessionZ>>({
    resolver: zodResolver(createSessionZ) as any,
    shouldUnregister: false,
    defaultValues: {
      name: "",
      cycleType: undefined,
      monthCount: 12,
      startDate: undefined,
      endDate: undefined,
    },
  });

  const handleSubmit = async (data: ICreateSession) => {
    setIsLoading(true);
    try {
      const response = await api.post("/sessions", data);
      if (!response.data.success)
        throw new Error(
          response.data.error?.message || "Failed to create session",
        );

      setIsAddOpen(false);
      getSessions({
        search: { global: debouncedGlobalSearch },
        filters: filterWith,
        currentPage: pagination.page,
      });
      toast.success("Session created successfully!");
      form.reset({
        name: "",
        cycleType: undefined,
        monthCount: 12,
        startDate: undefined,
        endDate: undefined,
      });
    } catch (error: any) {
      handleAxiosError(error);
      if (error.response?.data?.fields?.length) {
        error.response.data.fields.forEach((f: any) =>
          form.setError(f.name as any, { message: f.message }),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedGlobalSearch = useDebounce(search.global, 700);

  const getSessions = async ({
    search,
    filters,
    currentPage,
  }: {
    search: ISearch;
    filters: IFilter;
    currentPage: number;
  }) => {
    setIsLoading(true);
    try {
      const query = buildQuery({
        page: currentPage,
        search: search.global,
        isActive: filters?.isActive === "all" ? undefined : filters?.isActive,
        cycleType:
          filters?.cycleType === "all" ? undefined : filters?.cycleType,
        sortWith: filters?.sortWith,
        sortOrder: filters?.sortOrder,
        limit: filters?.limit,
      });

      const res = await api.get(`/sessions?${query}`);
      if (!res.data.success) throw new Error(res.data.error?.message);

      setSessions(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeFilterCount = () => {
    let count = 0;
    if (debouncedGlobalSearch?.trim()) count++;
    if (filterWith.isActive !== "all") count++;
    if (filterWith.cycleType !== "all") count++;
    return count;
  };

  const handleUpdate = async (data: IUpdateSession) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/sessions/${selectedId}`, data);
      if (!response.data.success)
        throw new Error(response.data.error?.message || "Update failed");

      getSessions({
        search: { global: debouncedGlobalSearch },
        filters: filterWith,
        currentPage: pagination.page,
      });
      toast.success("Updated successfully");
      form.reset({
        name: "",
        cycleType: undefined,
        monthCount: 12,
        startDate: undefined,
        endDate: undefined,
      });
    } catch (e) {
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
      setIsEditing(false);
      setIsAddOpen(false);
    }
  };

  const handleClearFilters = () => {
    setfilterWith({ isActive: "all", cycleType: "all" });
    setSearch({ global: "" });
  };

  const updateFilter = (key: string, value: string) => {
    if (key === "isActive") {
      const boolValue =
        value === "all" ? "all" : value === "true" ? true : false;
      setfilterWith((prev) => ({ ...prev, [key]: boolValue }));
      return;
    }
    setfilterWith((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const deleteSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await api.delete(`/sessions/${sessionId}`);
      if (!response.data.success)
        throw new Error(response.data.error?.message || "Delete failed");

      toast.success("Session deleted successfully");
      getSessions({
        search: { global: debouncedGlobalSearch },
        filters: filterWith,
        currentPage: pagination.page,
      });
      setIsDelOpen(false);
    } catch (error: any) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSessions({
      search: { global: debouncedGlobalSearch },
      filters: filterWith,
      currentPage: pagination.page,
    });
  }, [debouncedGlobalSearch, filterWith, pagination.page]);

  const combinedFilters = useMemo<Record<string, string | boolean | undefined>>(
    () => ({ ...filterWith }),
    [filterWith],
  );

  return {
    sessions,
    isLoading,
    pagination,
    search,
    filterWith,
    setPagination,
    refetch: getSessions,
    setValues,
    setSearch,
    setfilterWith,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
    isAddOpen,
    setIsAddOpen,
    selectedId,
    setIsEditing,
    setSelectedId,
    values,
    isEditing,
    handleUpdate,
    form,
    handleSubmit,
    setIsDelOpen,
    isDelOpen,
    deleteSession,
  };
}

export default useSessionQuery;
