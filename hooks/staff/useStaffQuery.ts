import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import { Branch, Gender, IPagination, IStaff } from "@/validations";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useDebounce } from "../common/useDebounce";

interface IFilter {
  dateRange: DateRange | undefined;
  salaryRange: { min: number | undefined; max: number | undefined };
  gender: "all" | Gender;
  branch: "all" | Branch;
  sortType?: SortType;
  sortBy?: "createdAt" | "updatedAt" | "firstName" | "staffId" | "joinDate";
  limit?: string;
}

interface ISearch {
  global: string;
}

type SortType = "asc" | "desc";

function useStaffQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [staffs, setStaffs] = useState<IStaff[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({
    global: "",
  });
  const [values, setValues] = useState<IStaff | null>(null);
  const [filterBy, setFilterBy] = useState<IFilter>({
    dateRange: { from: undefined, to: undefined },
    salaryRange: { min: undefined, max: undefined },
    branch: "all",
    gender: "all",

    sortBy: "createdAt",
    sortType: "desc" as SortType,
    limit: "10",
  });

  // debounce only search
  const debouncedGlobalSearch = useDebounce(search.global, 700);

  const debouncedSalaryMin = useDebounce(filterBy.salaryRange.min, 700);
  const debouncedSalaryMax = useDebounce(filterBy.salaryRange.max, 700);

  const getStaffs = async ({
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
        minSalary:
          filters.salaryRange.min !== undefined &&
          filters.salaryRange.max !== undefined
            ? filters.salaryRange.min
            : undefined,
        maxSalary:
          filters.salaryRange.min !== undefined &&
          filters.salaryRange.max !== undefined
            ? filters.salaryRange.max
            : undefined,
        branch: filters?.branch === "all" ? undefined : filters?.branch,
        gender: filters?.gender === "all" ? undefined : filters?.gender,
        sortBy: filters?.sortBy,
        sortType: filters?.sortType,
        limit: filters?.limit,
      });

      const res = await api.get(`/staffs?${query}`);

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

      setStaffs(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeFilterCount = () => {
    let count = 0;
    // Range filter
    if (filterBy.dateRange?.from && filterBy.dateRange?.to) count++;
    if (
      filterBy.salaryRange.min !== undefined &&
      filterBy.salaryRange.max !== undefined
    ) {
      count++;
    } // Select filters (only count if not "all")
    if (filterBy.branch && filterBy.branch !== "all") count++;
    if (filterBy.gender && filterBy.gender !== "all") count++;
    // Search filters (only count if not empty)
    if (debouncedGlobalSearch && debouncedGlobalSearch.trim()) count++;

    return count;
  };

  const handleClearFilters = () => {
    setFilterBy({
      dateRange: { from: undefined, to: undefined },
      salaryRange: { max: undefined, min: undefined },
      gender: "all",
      branch: "all",
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
    getStaffs({
      search: {
        global: debouncedGlobalSearch,
      },
      filters: {
        ...filterBy,
        salaryRange: {
          min: debouncedSalaryMin,
          max: debouncedSalaryMax,
        },
      },
      currentPage: pagination.page,
    });
  }, [
    pagination.page,
    debouncedGlobalSearch,
    debouncedSalaryMin,
    debouncedSalaryMax,
    filterBy.branch,
    filterBy.dateRange,
    filterBy.gender,
    filterBy.limit,
    filterBy.sortBy,
    filterBy.sortType,
  ]);

  // Combined filters for component usage (excluding dateRange as it's handled separately)
  const combinedFilters = useMemo<Record<string, string | undefined>>(() => {
    const { dateRange, salaryRange, ...restFilters } = filterBy;
    return {
      ...restFilters,
    };
  }, [filterBy]);

  return {
    staffs,
    isLoading,
    pagination,
    setPagination,
    refetch: getStaffs,
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

export default useStaffQuery;
