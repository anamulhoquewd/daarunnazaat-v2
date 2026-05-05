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
import { toast } from "sonner";

interface IFilter {
  dateRange: DateRange | undefined;
  feeRange: { min: number | undefined; max: number | undefined };
  sortOrder?: sortOrder;
  feeType?: "all" | FeeType;
  sortWith?:
    | "createdAt"
    | "updatedAt"
    | "fullName"
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

type sortOrder = "asc" | "desc";

function useFeesQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDelOpen, setIsDelOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fees, setFees] = useState<IFeeCollection[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({
    studentId: "",
    collectedBy: "",
    global: "",
    sessionId: "",
  });
  const [filterWith, setfilterWith] = useState<IFilter>({
    dateRange: { from: undefined, to: undefined },
    feeRange: { min: undefined, max: undefined },
    paymentMethod: "all",
    feeType: "all",
    sortWith: "createdAt",
    sortOrder: "desc" as sortOrder,
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
        collectedBy: search.collectedBy,
        studentId: search.studentId,
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
        sortWith: filters?.sortWith,
        sortOrder: filters?.sortOrder,
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
    if (filterWith.dateRange?.from && filterWith.dateRange?.to) count++;
    if (
      filterWith.feeRange.min !== undefined &&
      filterWith.feeRange.max !== undefined
    )
      count++;

    // Select filters (only count if not "all")
    if (filterWith.paymentMethod && filterWith.paymentMethod !== "all") count++;
    if (filterWith.feeType && filterWith.feeType !== "all") count++;
    if (filterWith.branch && filterWith.branch !== "all") count++;

    // Search filters (only count if not empty)
    if (debouncedStudentIdSearch && debouncedStudentIdSearch.trim()) count++;
    if (debouncedGlobalSearch && debouncedGlobalSearch.trim()) count++;
    if (debouncedCollectedBySearch && debouncedCollectedBySearch.trim())
      count++;

    return count;
  };

  const handleClearFilters = () => {
    setfilterWith({
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

    setfilterWith((prev) => ({ ...prev, [key]: value }));

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const deleteFlagOn = async (expenseId: string) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/fees/${expenseId}/delete`);
      if (!response.data.success) {
        toast.error(response.data.error.message || "Failed to delete user");
        throw new Error(response.data.error.message || "Failed to delete user");
      }
      toast.success(
        response.data.success.message || "User deleted successfully",
      );

      getFees({
        search: {
          global: debouncedGlobalSearch,
          collectedBy: debouncedCollectedBySearch,
          studentId: debouncedStudentIdSearch,
          sessionId: debouncedSessionIdSearch,
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

  const restoreFee = async (feeId: string) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/auth/${feeId}/restore`);
      if (!response.data.success) {
        toast.error(response.data.error.message || "Failed to restore user");
        throw new Error(
          response.data.error.message || "Failed to restore user",
        );
      }
      toast.success(
        response.data.success.message || "User restored successfully",
      );

      getFees({
        search: {
          global: debouncedGlobalSearch,
          collectedBy: debouncedCollectedBySearch,
          studentId: debouncedStudentIdSearch,
          sessionId: debouncedSessionIdSearch,
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

  const handleDelete = async (feeId: string) => {
    setIsLoading(true);

    try {
      const response = await api.delete(`/fees/${feeId}/permanently`);
      if (!response.data.success) {
        toast.error("Delete failed");
        throw new Error(response.data.error.message || "Failed to delete fee");
      }

      toast.success("Fee deleted successfully");

      getFees({
        search: {
          global: debouncedGlobalSearch,
          collectedBy: debouncedCollectedBySearch,
          studentId: debouncedStudentIdSearch,
          sessionId: debouncedSessionIdSearch,
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
    getFees({
      search: {
        global: debouncedGlobalSearch,
        collectedBy: debouncedCollectedBySearch,
        studentId: debouncedStudentIdSearch,
        sessionId: debouncedSessionIdSearch,
      },
      filters: filterWith,
      currentPage: pagination.page,
    });
  }, [
    debouncedGlobalSearch,
    debouncedStudentIdSearch,
    debouncedCollectedBySearch,
    debouncedSessionIdSearch,
    filterWith,
    pagination.page,
  ]);

  // Combined filters for component usage (excluding dateRange as it's handled separately)
  const combinedFilters = useMemo<Record<string, string | undefined>>(() => {
    const { dateRange, feeRange, ...restFilters } = filterWith;
    return {
      ...restFilters,
      studentId: search.studentId,
      collectedBy: search.collectedBy,
      sessionId: search.sessionId,
    };
  }, [filterWith, search.collectedBy, search.studentId, search.sessionId]);

  return {
    fees,
    isLoading,
    pagination,
    setPagination,
    refetch: getFees,
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
    deleteFlagOn,
    restoreFee,
  };
}

export default useFeesQuery;
