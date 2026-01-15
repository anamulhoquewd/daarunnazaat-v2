import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import {
  BatchType,
  Branch,
  Gender,
  IPagination,
  IStudent,
} from "@/validations";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../common/useDebounce";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface IFilter {
  dateRange: DateRange | undefined;
  batchType: "all" | BatchType;
  gender: "all" | Gender;
  branch: "all" | Branch;
  residential: "all" | boolean;
}

interface ISearch {
  global: string;
  classId: string;
  sessionId: string;
  guardianId: string;
}

function useStudentQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<IStudent[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({
    classId: "",
    sessionId: "",
    guardianId: "",
    global: "",
  });
  const [values, setValues] = useState<IStudent | null>(null);
  const [filterBy, setFilterBy] = useState<IFilter>({
    dateRange: { from: undefined, to: undefined },
    batchType: "all",
    residential: "all",
    branch: "all",
    gender: "all",
  });

  // debounce only search
  const debouncedGlobalSearch = useDebounce(search.global, 700);
  const debouncedGuardianSearch = useDebounce(search.guardianId, 700);
  const debouncedClassSearch = useDebounce(search.classId, 700);
  const debouncedSessionSearch = useDebounce(search.sessionId, 700);

  const getStudents = async ({
    search,
    filters,
    page,
  }: {
    search: ISearch;
    filters: IFilter;
    page: number;
  }) => {
    setIsLoading(true);

    try {
      const query = buildQuery({
        page,
        search: search.global,
        classId: search.classId,
        sessionId: search.sessionId,
        guardianId: search.guardianId,
        fromDate: filters?.dateRange?.from
          ? format(filters.dateRange.from, "yyyy-MM-dd")
          : undefined,
        toDate: filters?.dateRange?.to
          ? format(filters.dateRange.to, "yyyy-MM-dd")
          : undefined,
        isResidential:
          filters?.residential === "all" ? undefined : filters?.residential,
        batchType:
          filters?.batchType === "all" ? undefined : filters?.batchType,
        branch: filters?.branch === "all" ? undefined : filters?.branch,
        gender: filters?.gender === "all" ? undefined : filters?.gender,
      });

      const res = await api.get(`/students?${query}`);

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

      setStudents(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeFilterCount = () => {
    let count = 0;
    // Date range filter
    if (filterBy.dateRange?.from && filterBy.dateRange?.to) count++;
    // Select filters (only count if not "all")
    if (filterBy.batchType && filterBy.batchType !== "all") count++;
    if (filterBy.branch && filterBy.branch !== "all") count++;
    if (filterBy.residential && filterBy.residential !== "all") count++;
    if (filterBy.gender && filterBy.gender !== "all") count++;
    // Search filters (only count if not empty)
    if (debouncedClassSearch && debouncedClassSearch.trim()) count++;
    if (debouncedSessionSearch && debouncedSessionSearch.trim()) count++;
    if (debouncedGlobalSearch && debouncedGlobalSearch.trim()) count++;
    if (debouncedGuardianSearch && debouncedGuardianSearch.trim()) count++;

    return count;
  };

  const handleClearFilters = () => {
    setFilterBy({
      dateRange: { from: undefined, to: undefined },
      residential: "all",
      gender: "all",
      batchType: "all",
      branch: "all",
    });
    setSearch({
      classId: "",
      sessionId: "",
      guardianId: "",
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
  };

  // 🔥 API call only when debounced search OR page/limit changes
  useEffect(() => {
    getStudents({
      search: {
        global: debouncedGlobalSearch,
        guardianId: debouncedGuardianSearch,
        sessionId: debouncedSessionSearch,
        classId: debouncedClassSearch,
      },
      filters: filterBy,
      page: pagination.page,
    });
  }, [
    debouncedGlobalSearch,
    debouncedClassSearch,
    debouncedSessionSearch,
    debouncedGuardianSearch,
    filterBy,
  ]);

  // Combined filters for component usage (excluding dateRange as it's handled separately)
  const combinedFilters = useMemo<
    Record<string, string | boolean | undefined>
  >(() => {
    const { dateRange, ...restFilters } = filterBy;
    return {
      ...restFilters,
      classId: search.classId,
      guardianId: search.guardianId,
    };
  }, [filterBy, search.classId, search.guardianId]);

  return {
    students,
    isLoading,
    pagination,
    setPagination,
    refetch: getStudents,
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

export default useStudentQuery;
