import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import { classZ, IClass, IPagination, IUpdateClass } from "@/validations";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../common/useDebounce";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface IFilter {
  isActive: "all" | boolean;
  sortOrder?: sortOrder;
  sortWith?: "createdAt" | "updatedAt" | "className";
  limit?: string;
}

interface ISearch {
  global: string;
}

type sortOrder = "asc" | "desc";

function useClassQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDelOpen, setIsDelOpen] = useState<boolean>(false);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({
    global: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [values, setValues] = useState<IClass | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterWith, setfilterWith] = useState<IFilter>({
    isActive: "all",
    sortWith: "createdAt",
    sortOrder: "desc" as sortOrder,
    limit: "10",
  });

  const form = useForm({
    resolver: zodResolver(classZ),
    shouldUnregister: false,
    defaultValues: {
      className: "",
      description: "",
      monthlyFee: 0,
      capacity: 0,
      isActive: true,
    },
  });

  // debounce only search
  const debouncedGlobalSearch = useDebounce(search.global, 700);

  const getClasses = async ({
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
        isActive: filters?.isActive === "all" ? undefined : filters?.isActive,
        sortWith: filters?.sortWith,
        sortOrder: filters?.sortOrder,
        limit: filters?.limit,
      });

      const res = await api.get(`/classes?${query}`);

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

      setClasses(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: IClass) => {
    setIsLoading(true);

    try {
      const response = await api.post("/classes/register", data);

      if (!response.data.success) {
        throw new Error(
          response.data.error.message || "Failed to create class",
        );
      }

      getClasses({
        search: {
          global: debouncedGlobalSearch,
        },
        filters: filterWith,
        currentPage: pagination.page,
      });

      setIsAddOpen(false);

      form.reset({
        className: "",
        description: "",
        monthlyFee: 0,
        capacity: 0,
        isActive: true,
      });

      toast.success("Class created successfully!");
    } catch (error: any) {
      handleAxiosError(error);

      if (error.response?.data?.fields?.length) {
        error.response.data.fields.forEach((f: any) => {
          form.setError(f.name as any, {
            message: f.message,
          });
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const activeFilterCount = () => {
    let count = 0;
    if (debouncedGlobalSearch && debouncedGlobalSearch.trim()) count++;
    if (filterWith.isActive && filterWith.isActive !== "all") count++;

    return count;
  };

  const handleClearFilters = () => {
    setfilterWith({
      isActive: "all",
    });
    setSearch({
      global: "",
    });
  };

  const updateFilter = (key: string, value: string) => {
    // Handle filter fields
    if (key === "isActive") {
      // Convert string to boolean or "all"
      const boolValue =
        value === "all" ? "all" : value === "true" ? true : false;
      setfilterWith((prev) => ({ ...prev, [key]: boolValue }));
      return;
    }

    // Handle other filter fields (branch, gender, batchType)
    setfilterWith((prev) => ({ ...prev, [key]: value }));

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleUpdate = async (data: IUpdateClass) => {
    setIsLoading(true);

    try {
      const response = await api.patch(`/classes/${selectedId}`, data);
      if (!response.data.success) {
        toast.error("Update failed");
        throw new Error(response.data.error.message || "Failed to update user");
      }

      getClasses({
        search: {
          global: debouncedGlobalSearch,
        },
        filters: filterWith,
        currentPage: pagination.page,
      });
      toast.success("Updated successfully");
    } catch (e) {
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
      setIsEditing(false);
      setIsAddOpen(false);
    }
  };

  const deleteClass = async (classId: string) => {
    setIsLoading(true);

    try {
      const response = await api.delete(`/classes/${classId}/permanently`);
      if (!response.data.success) {
        toast.error("Delete failed");
        throw new Error(response.data.error.message || "Failed to delete user");
      }

      toast.success("Class deleted successfully");

      getClasses({
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
    getClasses({
      search: {
        global: debouncedGlobalSearch,
      },
      filters: filterWith,
      currentPage: pagination.page,
    });
  }, [debouncedGlobalSearch, filterWith, pagination.page]);

  // Combined filters for component usage (excluding dateRange as it's handled separately)
  const combinedFilters = useMemo<
    Record<string, string | boolean | undefined>
  >(() => {
    const { ...restFilters } = filterWith;
    return {
      ...restFilters,
    };
  }, [filterWith]);

  return {
    classes,
    isLoading,
    pagination,
    search,
    filterWith,
    setPagination,
    refetch: getClasses,
    setValues,
    setSearch,
    setfilterWith,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
    values,
    isAddOpen,
    setIsAddOpen,
    isEditing,
    setIsEditing,
    setSelectedId,
    handleUpdate,
    form,
    handleSubmit,
    setIsDelOpen,
    isDelOpen,
    deleteClass,
    selectedId,
  };
}

export default useClassQuery;
