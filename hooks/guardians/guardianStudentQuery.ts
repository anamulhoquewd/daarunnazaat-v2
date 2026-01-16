import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import { Gender, IPagination, IStudent } from "@/validations";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../common/useDebounce";

interface IFilter {
  sortType?: SortType;
  gender: "all" | Gender;
  sortBy?: "createdAt" | "updatedAt" | "firstName" | "guardianId" | "email";
  limit?: string;
}

interface ISearch {
  global: string;
}

type SortType = "asc" | "desc";

function useGuardianQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [guardians, setGuardians] = useState<IStudent[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({
    global: "",
  });
  const [values, setValues] = useState<IStudent | null>(null);
  const [filterBy, setFilterBy] = useState<IFilter>({
    gender: "all",
    sortBy: "createdAt",
    sortType: "desc" as SortType,
    limit: "10",
  });

  // debounce only search
  const debouncedGlobalSearch = useDebounce(search.global, 700);

  const getGuardian = async ({
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
        gender: filters?.gender === "all" ? undefined : filters?.gender,
        sortBy: filters?.sortBy,
        sortType: filters?.sortType,
        limit: filters?.limit,
      });

      const res = await api.get(`/guardians?${query}`);

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

      setGuardians(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeFilterCount = () => {
    let count = 0;

    if (filterBy.gender && filterBy.gender !== "all") count++;
    if (debouncedGlobalSearch && debouncedGlobalSearch.trim()) count++;

    return count;
  };

  const handleClearFilters = () => {
    setFilterBy({
      gender: "all",
    });
    setSearch({
      global: "",
    });
  };

  const updateFilter = (key: string, value: string) => {
    // Handle search fields (classId, guardianId) - these go to search state
    if (key === "classId" || key === "guardianId") {
      setSearch((prev) => ({ ...prev, [key]: value }));
      return;
    }

    // Handle filter fields
    if (key === "residential") {
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
    getGuardian({
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
    guardians,
    isLoading,
    pagination,
    setPagination,
    refetch: getGuardian,
    setValues,
    setSearch,
    search,
    filterBy,
    setFilterBy,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
  };
}

export default useGuardianQuery;
