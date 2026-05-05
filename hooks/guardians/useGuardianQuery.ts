import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import { Gender, IGuardian, IPagination } from "@/validations";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { useDebounce } from "../common/useDebounce";

interface IFilter {
  dateRange?: DateRange;
  sortOrder?: sortOrder;
  gender: "all" | Gender;
  isDeleted?: boolean;
  sortWith?: "createdAt" | "updatedAt" | "fullName" | "guardianId" | "email";
  limit?: string;
}

interface ISearch {
  global: string;
}

type sortOrder = "asc" | "desc";

function useGuardianQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [guardians, setGuardians] = useState<IGuardian[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [isDelOpen, setIsDelOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState<ISearch>({
    global: "",
  });
  const [filterWith, setFilterWith] = useState<IFilter>({
    dateRange: { from: undefined, to: undefined },
    gender: "all",
    isDeleted: undefined,
    sortWith: "createdAt",
    sortOrder: "desc" as sortOrder,
    limit: "1",
  });

  console.log("Filter: ", filterWith);

  const debouncedGlobalSearch = useDebounce(search.global, 700);

  const getGuardians = async ({
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
        gender: filters?.gender === "all" ? undefined : filters?.gender,
        isDeleted: filters?.isDeleted === false ? undefined : filters.isDeleted,
        sortWith: filters?.sortWith,
        sortOrder: filters?.sortOrder,
        limit: filters?.limit,
      });

      const res = await api.get(`/guardians?${query}`);

      if (!res.data) {
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
    if (filterWith.dateRange?.from && filterWith.dateRange?.to) count++;
    if (filterWith.gender && filterWith.gender !== "all") count++;
    if (filterWith.isDeleted === true) count++;
    if (debouncedGlobalSearch && debouncedGlobalSearch.trim()) count++;
    return count;
  };

  const handleClearFilters = () => {
    setFilterWith({
      dateRange: { from: undefined, to: undefined },
      gender: "all",
      isDeleted: undefined,
    });
    setSearch({ global: "" });
  };

  const activeGuardian = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/guardians/${userId}/activate`);

      if (!response.data) {
        toast.error(
          response.data.error.message || "Failed to activate guardian",
        );
        throw new Error(
          response.data.error.message || "Failed to activate guardian",
        );
      }

      toast.success(response.data.message || "Guardian activated successfully");

      getGuardians({
        search: { global: debouncedGlobalSearch },
        filters: filterWith,
        currentPage: pagination.page,
      });
    } catch (error: any) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deactiveGuardian = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/guardians/${userId}/deactivate`);

      if (!response.data) {
        toast.error(
          response.data.error.message || "Failed to deactivate guardian",
        );
        throw new Error(
          response.data.error.message || "Failed to deactivate guardian",
        );
      }

      toast.success(
        response.data.message || "Guardian deactivated successfully",
      );

      getGuardians({
        search: { global: debouncedGlobalSearch },
        filters: filterWith,
        currentPage: pagination.page,
      });
    } catch (error: any) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (key: string, value: string | boolean | undefined) => {
    const normalizedValue =
      key === "isDeleted" && typeof value === "string"
        ? value === "true"
        : value;

    setFilterWith((prev) => ({ ...prev, [key]: normalizedValue }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSoftDelete = async (guardianId: string, reason: string) => {
    setIsLoading(true);
    try {
      const response = await api.delete(`/guardians/${guardianId}`, {
        data: { reason },
      });

      console.log("Res: ", response);

      if (!response.data.data) {
        toast.error("Failed to delete guardian");
        throw new Error(
          response.data.error.message || "Failed to delete guardian",
        );
      }

      toast.success(response.data.message || "Guardian deleted successfully");

      getGuardians({
        search: { global: debouncedGlobalSearch },
        filters: filterWith,
        currentPage: pagination.page,
      });
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (guardianId: string) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/guardians/${guardianId}/restore`);
      console.log("Restore Res: ", response);
      if (!response.data) {
        toast.error(
          response.data.error.message || "Failed to restore guardian",
        );
        throw new Error(
          response.data.error.message || "Failed to restore guardian",
        );
      }

      toast.success(response.data.message || "Guardian restored successfully");
      getGuardians({
        search: { global: debouncedGlobalSearch },
        filters: filterWith,
        currentPage: pagination.page,
      });
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (guardianId: string) => {
    setIsLoading(true);
    try {
      const response = await api.delete(`/guardians/${guardianId}/permanent`);

      if (!response.data.success) {
        toast.error(response.data.error.message || "Failed to delete guardian");
        throw new Error(
          response.data.error.message || "Failed to delete guardian",
        );
      }

      toast.success(
        response.data.success.message || "Guardian deleted successfully",
      );

      getGuardians({
        search: { global: debouncedGlobalSearch },
        filters: filterWith,
        currentPage: pagination.page,
      });
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getGuardians({
      search: { global: debouncedGlobalSearch },
      filters: filterWith,
      currentPage: pagination.page,
    });
  }, [debouncedGlobalSearch, filterWith, pagination.page]);

  const combinedFilters = useMemo<
    Record<string, string | boolean | undefined>
  >(() => {
    const { dateRange, ...restFilters } = filterWith;
    return { ...restFilters };
  }, [filterWith]);

  return {
    guardians,
    isLoading,
    pagination,
    setPagination,
    refetch: getGuardians,
    setSearch,
    search,
    filterWith,
    setFilterWith,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
    activeGuardian,
    deactiveGuardian,
    handleDelete,
    setSelectedId,
    selectedId,
    setIsDelOpen,
    isDelOpen,
    handleSoftDelete,
    handleRestore,
  };
}

export default useGuardianQuery;
