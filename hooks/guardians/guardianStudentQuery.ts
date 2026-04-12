import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import { Gender, IGuardian, IPagination } from "@/validations";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../common/useDebounce";
import { toast } from "sonner";
import { set } from "mongoose";

interface IFilter {
  sortType?: SortType;
  gender: "all" | Gender;
  sortBy?: "createdAt" | "updatedAt" | "fullName" | "guardianId" | "email";
  limit?: string;
}

interface ISearch {
  global: string;
}

type SortType = "asc" | "desc";

function useGuardianQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [guardians, setGuardians] = useState<IGuardian[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [isDelOpen, setIsDelOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState<ISearch>({
    global: "",
  });
  const [values, setValues] = useState<IGuardian | null>(null);
  const [filterBy, setFilterBy] = useState<IFilter>({
    gender: "all",
    sortBy: "createdAt",
    sortType: "desc" as SortType,
    limit: "10",
  });

  // debounce only search
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

  const activeGuardian = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/guardians/${userId}/activate`);

      if (!response.data.success) {
        toast.error(
          response.data.error.message || "Failed to activate guardian",
        );
        throw new Error(
          response.data.error.message || "Failed to activate guardian",
        );
      }

      toast.success(
        response.data.success.message || "Guardian activated successfully",
      );

      getGuardians({
        search: {
          global: debouncedGlobalSearch,
        },
        filters: filterBy,
        currentPage: pagination.page,
      });
    } catch (error: any) {
      toast.error("Failed to update user status");
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deactiveGuardian = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/guardians/${userId}/deactivate`);
      if (!response.data.success) {
        toast.error(
          response.data.error.message || "Failed to deactivate guardian",
        );
        throw new Error(
          response.data.error.message || "Failed to deactivate guardian",
        );
      }
      toast.success(
        response.data.success.message || "Guardian deactivated successfully",
      );

      getGuardians({
        search: {
          global: debouncedGlobalSearch,
        },
        filters: filterBy,
        currentPage: pagination.page,
      });
    } catch (error: any) {
      toast.error("Failed to update user status");
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
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

  const handleDelete = async (guardianId: string) => {
    setIsLoading(true);
    try {
      const response = await api.delete(`/guardians/${guardianId}/permanently`);

      if (!response.data.success) {
        toast.error(response.data.error.message || "Failed to delete guardian");
        throw new Error(
          response.data.error.message || "Failed to delete guardian",
        );
      }

      toast.success(
        response.data.success.message || "guardian deleted successfully",
      );

      getGuardians({
        search: {
          global: debouncedGlobalSearch,
        },
        filters: filterBy,
        currentPage: pagination.page,
      });
    } catch (error) {
      toast.error("An error occurred while deleting the guardian.");
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 API call only when debounced search OR page/limit changes
  useEffect(() => {
    getGuardians({
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
    refetch: getGuardians,
    setValues,
    setSearch,
    search,
    filterBy,
    setFilterBy,
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
  };
}

export default useGuardianQuery;
