import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import {
  Branch,
  FeeType,
  IPagination,
  ITransactionLog,
  PaymentMethod,
  TransactionType,
} from "@/validations";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useDebounce } from "../common/useDebounce";

interface IFilter {
  dateRange: DateRange | undefined;
  amountRange: { min: number | undefined; max: number | undefined };
  sortType?: SortType;
  sortBy?: "createdAt" | "updatedAt";
  limit?: string;
  transactionType: "all" | TransactionType;
  branch: "all" | Branch;
}

interface ISearch {
  global: string;
  referenceId: string;
}
type SortType = "asc" | "desc";

function useTransactionsQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<ITransactionLog[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({
    referenceId: "",
    global: "",
  });
  const [filterBy, setFilterBy] = useState<IFilter>({
    dateRange: { from: undefined, to: undefined },
    amountRange: { min: undefined, max: undefined },
    transactionType: "all",
    sortBy: "createdAt",
    sortType: "desc" as SortType,
    limit: "10",
    branch: "all" as Branch,
  });

  // debounce only search
  const debouncedGlobalSearch = useDebounce(search.global, 700);
  const debouncedreferenceIdSearch = useDebounce(search.referenceId, 700);

  const getTransactions = async ({
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
        referenceId: search.referenceId,
        transactionType:
          filters?.transactionType === "all"
            ? undefined
            : filters?.transactionType,
        branch: filters?.branch === "all" ? undefined : filters?.branch,
        fromDate: filters?.dateRange?.from
          ? format(filters.dateRange.from, "yyyy-MM-dd")
          : undefined,
        toDate: filters?.dateRange?.to
          ? format(filters.dateRange.to, "yyyy-MM-dd")
          : undefined,
        minAmount:
          filters.amountRange.min !== undefined &&
          filters.amountRange.max !== undefined
            ? filters.amountRange.min
            : undefined,
        maxAmount:
          filters.amountRange.min !== undefined &&
          filters.amountRange.max !== undefined
            ? filters.amountRange.max
            : undefined,
        sortBy: filters?.sortBy,
        sortType: filters?.sortType,
        limit: filters?.limit,
      });

      const res = await api.get(`/transactions?${query}`);

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

      setTransactions(res.data.data || []);
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
      filterBy.amountRange.min !== undefined &&
      filterBy.amountRange.max !== undefined
    )
      count++;

    // Select filters (only count if not "all")
    if (filterBy.transactionType && filterBy.transactionType !== "all") count++;
    if (filterBy.branch && filterBy.branch !== "all") count++;

    // Search filters (only count if not empty)
    if (debouncedGlobalSearch && debouncedGlobalSearch.trim()) count++;
    if (debouncedreferenceIdSearch && debouncedreferenceIdSearch.trim())
      count++;

    return count;
  };

  const handleClearFilters = () => {
    setFilterBy({
      dateRange: { from: undefined, to: undefined },
      amountRange: { min: undefined, max: undefined },
      transactionType: "all",
      branch: "all",
    });
    setSearch({
      referenceId: "",
      global: "",
    });
  };

  const updateFilter = (key: string, value: string) => {
    // Handle search fields (referenceId) - these go to search state
    if (key === "referenceId") {
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
    getTransactions({
      search: {
        global: debouncedGlobalSearch,
        referenceId: debouncedreferenceIdSearch,
      },
      filters: filterBy,
      currentPage: pagination.page,
    });
  }, [
    debouncedGlobalSearch,
    debouncedreferenceIdSearch,
    filterBy,
    pagination.page,
  ]);

  // Combined filters for component usage (excluding dateRange as it's handled separately)
  const combinedFilters = useMemo<Record<string, string | undefined>>(() => {
    const { dateRange, amountRange, ...restFilters } = filterBy;
    return {
      ...restFilters,
      referenceId: search.referenceId,
    };
  }, [filterBy, search.referenceId]);

  return {
    transactions,
    isLoading,
    pagination,
    setPagination,
    refetch: getTransactions,
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

export default useTransactionsQuery;
