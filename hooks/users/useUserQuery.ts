import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import { IPagination, IStudent, UserRole } from "@/validations";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useDebounce } from "../common/useDebounce";

interface IFilter {
  dateRange: DateRange | undefined;
  isActive: "all" | boolean;
  isBlocked: "all" | boolean;
  sortType?: SortType;
  sortBy?: "createdAt" | "updatedAt" | "email" | "userId";
  role: UserRole | "all";
  limit?: string;
}

interface ISearch {
  global: string;
}

type SortType = "asc" | "desc";

function useUserQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<IStudent[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({
    global: "",
  });
  const [values, setValues] = useState<IStudent | null>(null);
  const [filterBy, setFilterBy] = useState<IFilter>({
    dateRange: { from: undefined, to: undefined },
    isActive: "all",
    isBlocked: "all",
    sortBy: "createdAt",
    sortType: "desc" as SortType,
    limit: "10",
    role: "all",
  });

  // debounce only search
  const debouncedGlobalSearch = useDebounce(search.global, 700);

  const getUsers = async ({
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
        fromDate: filters?.dateRange?.from
          ? format(filters.dateRange.from, "yyyy-MM-dd")
          : undefined,
        toDate: filters?.dateRange?.to
          ? format(filters.dateRange.to, "yyyy-MM-dd")
          : undefined,
        isActive: filters?.isActive === "all" ? undefined : filters?.isActive,
        isBlocked:
          filters?.isBlocked === "all" ? undefined : filters?.isBlocked,
        role: filters?.role === "all" ? undefined : filters?.role,
        sortBy: filters?.sortBy,
        sortType: filters?.sortType,
        limit: filters?.limit,
      });

      const res = await api.get(`/users?${query}`);

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

      setUsers(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filterBy.dateRange?.from && filterBy.dateRange?.to) count++;
    if (debouncedGlobalSearch && debouncedGlobalSearch.trim()) count++;
    if (filterBy.isActive && filterBy.isActive !== "all") count++;
    if (filterBy.isBlocked && filterBy.isBlocked !== "all") count++;
    if (filterBy.role && filterBy.role !== "all") count++;

    return count;
  };

  const handleClearFilters = () => {
    setFilterBy({
      dateRange: { from: undefined, to: undefined },
      isActive: "all",
      isBlocked: "all",
      role: "all",
    });
    setSearch({
      global: "",
    });
  };

  const updateFilter = (key: string, value: string) => {
    // Handle filter fields
    if (key === "isActive" || key === "isBlocked") {
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
    getUsers({
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
    const { dateRange, ...restFilters } = filterBy;
    return {
      ...restFilters,
    };
  }, [filterBy]);

  return {
    users,
    isLoading,
    pagination,
    search,
    filterBy,
    setPagination,
    refetch: getUsers,
    setValues,
    setSearch,
    setFilterBy,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
  };
}

export default useUserQuery;
