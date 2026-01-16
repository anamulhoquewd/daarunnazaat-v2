import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import { IPagination, ISalaryPayment, PaymentMethod } from "@/validations";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useDebounce } from "../common/useDebounce";

interface IFilter {
  dateRange: DateRange | undefined;
  netSalaryRange: { min: number | undefined; max: number | undefined };
  sortType?: SortType;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "firstName"
    | "studentId"
    | "admissionDate";
  limit?: string;
  paymentMethod: "all" | PaymentMethod;
}

interface ISearch {
  global: string;
  paidBy: string;
  staffId: string;
}

type SortType = "asc" | "desc";

function useSalariesQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [salaries, setSalaries] = useState<ISalaryPayment[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({
    paidBy: "",
    staffId: "",
    global: "",
  });
  const [values, setValues] = useState<ISalaryPayment | null>(null);
  const [filterBy, setFilterBy] = useState<IFilter>({
    dateRange: { from: undefined, to: undefined },
    netSalaryRange: { min: undefined, max: undefined },
    paymentMethod: "all",
    sortBy: "createdAt",
    sortType: "desc" as SortType,
    limit: "10",
  });

  // debounce only search
  const debouncedGlobalSearch = useDebounce(search.global, 700);
  const debouncedStaffSearch = useDebounce(search.staffId, 700);
  const debouncedPaidBySearch = useDebounce(search.paidBy, 700);

  const getSalaries = async ({
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
        paidBy: search.paidBy,
        staffId: search.staffId,
        paymentMethod:
          filters?.paymentMethod === "all" ? undefined : filters?.paymentMethod,
        fromDate: filters?.dateRange?.from
          ? format(filters.dateRange.from, "yyyy-MM-dd")
          : undefined,
        toDate: filters?.dateRange?.to
          ? format(filters.dateRange.to, "yyyy-MM-dd")
          : undefined,
        minSalary:
          filters.netSalaryRange.min !== undefined &&
          filters.netSalaryRange.max !== undefined
            ? filters.netSalaryRange.min
            : undefined,
        maxSalary:
          filters.netSalaryRange.min !== undefined &&
          filters.netSalaryRange.max !== undefined
            ? filters.netSalaryRange.max
            : undefined,
        sortBy: filters?.sortBy,
        sortType: filters?.sortType,
        limit: filters?.limit,
      });

      const res = await api.get(`/salaries?${query}`);

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

      setSalaries(res.data.data || []);
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
      filterBy.netSalaryRange.min !== undefined &&
      filterBy.netSalaryRange.max !== undefined
    )
      count++;

    // Select filters (only count if not "all")
    if (filterBy.paymentMethod && filterBy.paymentMethod !== "all") count++;

    // Search filters (only count if not empty)
    if (debouncedPaidBySearch && debouncedPaidBySearch.trim()) count++;
    if (debouncedGlobalSearch && debouncedGlobalSearch.trim()) count++;
    if (debouncedStaffSearch && debouncedStaffSearch.trim()) count++;

    return count;
  };

  const handleClearFilters = () => {
    setFilterBy({
      dateRange: { from: undefined, to: undefined },
      netSalaryRange: { min: undefined, max: undefined },
      paymentMethod: "all",
    });
    setSearch({
      staffId: "",
      paidBy: "",
      global: "",
    });
  };

  const updateFilter = (key: string, value: string) => {
    // Handle search fields (staffId, paidBy) - these go to search state
    if (key === "staffId" || key === "paidBy") {
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
    getSalaries({
      search: {
        global: debouncedGlobalSearch,
        staffId: debouncedStaffSearch,
        paidBy: debouncedPaidBySearch,
      },
      filters: filterBy,
      currentPage: pagination.page,
    });
  }, [
    debouncedGlobalSearch,
    debouncedPaidBySearch,
    debouncedStaffSearch,
    filterBy,
    pagination.page,
  ]);

  // Combined filters for component usage (excluding dateRange as it's handled separately)
  const combinedFilters = useMemo<Record<string, string | undefined>>(() => {
    const { dateRange, netSalaryRange, ...restFilters } = filterBy;
    return {
      ...restFilters,
      staffId: search.staffId,
      paidBy: search.paidBy,
    };
  }, [filterBy, search.paidBy, search.staffId]);

  console.log("Filters: ", filterBy);

  return {
    salaries,
    isLoading,
    pagination,
    setPagination,
    refetch: getSalaries,
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

export default useSalariesQuery;
