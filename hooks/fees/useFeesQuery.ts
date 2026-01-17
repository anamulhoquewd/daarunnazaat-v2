import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import {
  Branch,
  FeeType,
  IFeeCollection,
  IPagination,
  PaymentMethod,
} from "@/validations";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useDebounce } from "../common/useDebounce";

interface IFilter {
  dateRange: DateRange | undefined;
  feeRange: { min: number | undefined; max: number | undefined };
  sortType?: SortType;
  feeType?: "all" | FeeType;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "firstName"
    | "studentId"
    | "admissionDate";
  limit?: string;
  paymentMethod: "all" | PaymentMethod;
  branch: "all" | Branch;
}

interface ISearch {
  global: string;
  studentId: string;
  collectedBy: string;
  sessionId: string;
}

type SortType = "asc" | "desc";

function useFeesQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [fees, setFees] = useState<IFeeCollection[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({
    studentId: "",
    collectedBy: "",
    global: "",
    sessionId: "",
  });
  const [values, setValues] = useState<IFeeCollection | null>(null);
  const [filterBy, setFilterBy] = useState<IFilter>({
    dateRange: { from: undefined, to: undefined },
    feeRange: { min: undefined, max: undefined },
    paymentMethod: "all",
    feeType: "all",
    sortBy: "createdAt",
    sortType: "desc" as SortType,
    limit: "10",
    branch: "all" as Branch,
  });

  // debounce only search
  const debouncedGlobalSearch = useDebounce(search.global, 700);
  const debouncedCollectedBySearch = useDebounce(search.collectedBy, 700);
  const debouncedStudentIdSearch = useDebounce(search.studentId, 700);
  const debouncedSessionIdSearch = useDebounce(search.sessionId, 700);

  const getFees = async ({
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
        paidBy: search.collectedBy,
        staffId: search.studentId,
        paymentMethod:
          filters?.paymentMethod === "all" ? undefined : filters?.paymentMethod,
        feeType: filters?.feeType === "all" ? undefined : filters?.feeType,
        branch: filters?.branch === "all" ? undefined : filters?.branch,
        fromDate: filters?.dateRange?.from
          ? format(filters.dateRange.from, "yyyy-MM-dd")
          : undefined,
        toDate: filters?.dateRange?.to
          ? format(filters.dateRange.to, "yyyy-MM-dd")
          : undefined,
        minFee:
          filters.feeRange.min !== undefined &&
          filters.feeRange.max !== undefined
            ? filters.feeRange.min
            : undefined,
        maxFee:
          filters.feeRange.min !== undefined &&
          filters.feeRange.max !== undefined
            ? filters.feeRange.max
            : undefined,
        sortBy: filters?.sortBy,
        sortType: filters?.sortType,
        limit: filters?.limit,
      });

      const res = await api.get(`/fees?${query}`);

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

      setFees(res.data.data || []);
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
      filterBy.feeRange.min !== undefined &&
      filterBy.feeRange.max !== undefined
    )
      count++;

    // Select filters (only count if not "all")
    if (filterBy.paymentMethod && filterBy.paymentMethod !== "all") count++;
    if (filterBy.feeType && filterBy.feeType !== "all") count++;
    if (filterBy.branch && filterBy.branch !== "all") count++;

    // Search filters (only count if not empty)
    if (debouncedStudentIdSearch && debouncedStudentIdSearch.trim()) count++;
    if (debouncedGlobalSearch && debouncedGlobalSearch.trim()) count++;
    if (debouncedCollectedBySearch && debouncedCollectedBySearch.trim())
      count++;

    return count;
  };

  const handleClearFilters = () => {
    setFilterBy({
      dateRange: { from: undefined, to: undefined },
      feeRange: { min: undefined, max: undefined },
      paymentMethod: "all",
      feeType: "all",
      branch: "all",
    });
    setSearch({
      collectedBy: "",
      studentId: "",
      sessionId: "",
      global: "",
    });
  };

  const updateFilter = (key: string, value: string) => {
    // Handle search fields (sessionId, collectedBy, studentId) - these go to search state
    if (key === "sessionId" || key === "collectedBy" || key === "studentId") {
      setSearch((prev) => ({ ...prev, [key]: value }));
      return;
    }

    setFilterBy((prev) => ({ ...prev, [key]: value }));

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  // 🔥 API call only when debounced search OR page/limit changes
  useEffect(() => {
    getFees({
      search: {
        global: debouncedGlobalSearch,
        collectedBy: debouncedCollectedBySearch,
        studentId: debouncedStudentIdSearch,
        sessionId: debouncedSessionIdSearch,
      },
      filters: filterBy,
      currentPage: pagination.page,
    });
  }, [
    debouncedGlobalSearch,
    debouncedStudentIdSearch,
    debouncedCollectedBySearch,
    debouncedSessionIdSearch,
    filterBy,
    pagination.page,
  ]);

  // Combined filters for component usage (excluding dateRange as it's handled separately)
  const combinedFilters = useMemo<Record<string, string | undefined>>(() => {
    const { dateRange, feeRange, ...restFilters } = filterBy;
    return {
      ...restFilters,
      studentId: search.studentId,
      collectedBy: search.collectedBy,
      sessionId: search.sessionId,
    };
  }, [filterBy, search.collectedBy, search.studentId, search.sessionId]);

  return {
    fees,
    isLoading,
    pagination,
    setPagination,
    refetch: getFees,
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

export default useFeesQuery;
