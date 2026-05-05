import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import { Branch, ExpenseCategory, IExpense, IPagination } from "@/validations";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { useDebounce } from "../common/useDebounce";

interface IFilter {
  dateRange: DateRange | undefined;
  amountRange: { min: number | undefined; max: number | undefined };
  sortOrder?: sortOrder;
  category?: "all" | ExpenseCategory;
  sortWith?: "createdAt" | "updatedAt" | "expenseDate";
  limit?: string;
  branch: "all" | Branch;
}

interface ISearch {
  global: string;
}

type sortOrder = "asc" | "desc";

function useExpensesQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDelOpen, setIsDelOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({
    global: "",
  });
  const [filterWith, setfilterWith] = useState<IFilter>({
    dateRange: { from: undefined, to: undefined },
    amountRange: { min: undefined, max: undefined },
    category: "all" as ExpenseCategory,
    sortWith: "createdAt",
    sortOrder: "desc" as sortOrder,
    limit: "10",
    branch: "all" as Branch,
  });

  // debounce only search
  const debouncedGlobalSearch = useDebounce(search.global, 700);

  const getExpenses = async ({
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
        category: filters?.category === "all" ? undefined : filters?.category,
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
        sortWith: filters?.sortWith,
        sortOrder: filters?.sortOrder,
        limit: filters?.limit,
      });

      const res = await api.get(`/expenses?${query}`);

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

      setExpenses(res.data.data || []);
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
    if (filterWith.dateRange?.from && filterWith.dateRange?.to) count++;
    if (
      filterWith.amountRange.min !== undefined &&
      filterWith.amountRange.max !== undefined
    )
      count++;

    // Select filters (only count if not "all")
    if (filterWith.category && filterWith.category !== "all") count++;
    if (filterWith.branch && filterWith.branch !== "all") count++;

    // Search filters (only count if not empty)
    if (debouncedGlobalSearch && debouncedGlobalSearch.trim()) count++;

    return count;
  };

  const handleClearFilters = () => {
    setfilterWith({
      dateRange: { from: undefined, to: undefined },
      amountRange: { min: undefined, max: undefined },
      category: "all",
      branch: "all",
    });
    setSearch({
      global: "",
    });
  };

  const updateFilter = (key: string, value: string) => {
    setfilterWith((prev) => ({ ...prev, [key]: value }));

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const deleteFlagOn = async (expenseId: string) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/expenses/${expenseId}/delete`);
      if (!response.data.success) {
        toast.error(response.data.error.message || "Failed to delete user");
        throw new Error(response.data.error.message || "Failed to delete user");
      }
      toast.success(
        response.data.success.message || "User deleted successfully",
      );

      getExpenses({
        search: {
          global: debouncedGlobalSearch,
        },
        filters: filterWith,
        currentPage: pagination.page,
      });
    } catch (error: any) {
      toast.error("An error occurred while deleting the user.");
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const restoreExpense = async (expenseId: string) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/auth/${expenseId}/restore`);
      if (!response.data.success) {
        toast.error(response.data.error.message || "Failed to restore user");
        throw new Error(
          response.data.error.message || "Failed to restore user",
        );
      }
      toast.success(
        response.data.success.message || "User restored successfully",
      );

      getExpenses({
        search: {
          global: debouncedGlobalSearch,
        },
        filters: filterWith,
        currentPage: pagination.page,
      });
    } catch (error: any) {
      toast.error("An error occurred while restoring the user.");
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (expenseId: string) => {
    setIsLoading(true);

    try {
      const response = await api.delete(`/expenses/${expenseId}/permanently`);
      if (!response.data.success) {
        toast.error("Delete failed");
        throw new Error(
          response.data.error.message || "Failed to delete expense",
        );
      }

      toast.success("Expense deleted successfully");

      getExpenses({
        search: {
          global: debouncedGlobalSearch,
        },
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

  // 🔥 API call only when debounced search OR page/limit changes
  useEffect(() => {
    getExpenses({
      search: {
        global: debouncedGlobalSearch,
      },
      filters: filterWith,
      currentPage: pagination.page,
    });
  }, [debouncedGlobalSearch, filterWith, pagination.page]);

  // Combined filters for component usage (excluding dateRange as it's handled separately)
  const combinedFilters = useMemo<Record<string, string | undefined>>(() => {
    const { dateRange, amountRange, ...restFilters } = filterWith;

    return restFilters;
  }, [filterWith]);

  return {
    expenses,
    restoreExpense,
    deleteFlagOn,
    isLoading,
    pagination,
    setPagination,
    refetch: getExpenses,
    setSearch,
    search,
    filterWith,
    setfilterWith,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
    isDelOpen,
    setIsDelOpen,
    selectedId,
    setSelectedId,
    handleDelete,
  };
}

export default useExpensesQuery;
