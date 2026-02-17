import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import {
  BatchType,
  ISession,
  IPagination,
  IUpdateSession,
} from "@/validations";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../common/useDebounce";
import { toast } from "sonner";

interface IFilter {
  isActive: "all" | boolean;
  sortType?: SortType;
  sortBy?: "createdAt" | "updatedAt" | "sessionName";
  batchType: "all" | BatchType;
  limit?: string;
}

interface ISearch {
  global: string;
}

type SortType = "asc" | "desc";

function useSessionQuery() {
  const [isLoading, setIsLoading] = useState(false);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [values, setValues] = useState<ISession | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ISession[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({
    global: "",
  });
  const [filterBy, setFilterBy] = useState<IFilter>({
    isActive: "all",
    sortBy: "createdAt",
    sortType: "desc" as SortType,
    batchType: "all",
    limit: "10",
  });

  // debounce only search
  const debouncedGlobalSearch = useDebounce(search.global, 700);

  const getClasses = async ({
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
        batchType:
          filters?.batchType === "all" ? undefined : filters?.batchType,
        sortBy: filters?.sortBy,
        sortType: filters?.sortType,
        limit: filters?.limit,
      });

      const res = await api.get(`/sessions?${query}`);

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

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
    if (debouncedGlobalSearch && debouncedGlobalSearch.trim()) count++;
    if (filterBy.isActive && filterBy.isActive !== "all") count++;
    if (filterBy.batchType !== "all") count++;

    return count;
  };

  const handleUpdate = async (data: IUpdateSession) => {
    setIsLoading(true);

    console.log("Updating session with data:", data, "and ID:", selectedId);

    try {
      const response = await api.patch(`/sessions/${selectedId}`, data);
      if (!response.data.success) {
        toast.error("Update failed");
        throw new Error(response.data.error.message || "Failed to update user");
      }

      getClasses({
        search: {
          global: debouncedGlobalSearch,
        },
        filters: filterBy,
        currentPage: pagination.page,
      });
      toast.success("Updated successfully");
    } catch (e) {
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
      setIsEditing(false);
      setIsAddOpen(false);
    }
  };

  const handleClearFilters = () => {
    setFilterBy({
      isActive: "all",
      batchType: "all",
    });
    setSearch({
      global: "",
    });
  };

  const updateFilter = (key: string, value: string) => {
    // Handle filter fields
    if (key === "isActive") {
      // Convert string to boolean or "all"
      const boolValue =
        value === "all" ? "all" : value === "true" ? true : false;
      setFilterBy((prev) => ({ ...prev, [key]: boolValue }));
      return;
    }

    // Handle other filter fields (branch, gender, batchType)
    setFilterBy((prev) => ({ ...prev, [key]: value }));

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  // 🔥 API call only when debounced search OR page/limit changes
  useEffect(() => {
    getClasses({
      search: {
        global: debouncedGlobalSearch,
      },
      filters: filterBy,
      currentPage: pagination.page,
    });
  }, [debouncedGlobalSearch, filterBy, pagination.page]);

  // Combined filters for component usage (excluding dateRange as it's handled separately)
  const combinedFilters = useMemo<
    Record<string, string | boolean | undefined>
  >(() => {
    const { ...restFilters } = filterBy;
    return {
      ...restFilters,
    };
  }, [filterBy]);

  return {
    sessions,
    isLoading,
    pagination,
    search,
    filterBy,
    setPagination,
    refetch: getClasses,
    setValues,
    setSearch,
    setFilterBy,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
    isAddOpen,
    setIsAddOpen,
    setIsEditing,
    setSelectedId,
    values,
    isEditing,
    handleUpdate,
  };
}

export default useSessionQuery;
