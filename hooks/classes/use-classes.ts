import api from "@/axios/intercepter";
import { IClass, IPagination } from "@/interfaces";
import { defaultPagination } from "@/lib/utils";
import { classCreateZ, TClassCreate, TClassUpdate } from "@/validations/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function useClasses() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<IClass | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [classes, setClasses] = useState<IClass[] | []>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);

  // Initialize form with default values
  const form = useForm<TClassCreate>({
    resolver: zodResolver(classCreateZ),
    defaultValues: {
      name: "",
      description: "",
      opening_date: new Date(),
      teacher: "",
    },
  });

  // Form submission
  const handleSubmit = async (data: TClassUpdate) => {
    setIsLoading(true);

    try {
      const response = await api.post("/classes/register", data);

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      form.reset({
        name: "",
        description: "",
        opening_date: new Date(),
        teacher: "",
      });

      fetchClasses({ page: pagination.page, search: searchQuery });

      toast(response.data.message || "Class created successfully!");
      setIsAddOpen(false);
    } catch (error: any) {
      console.error("Error creating user:", error);

      if (error.response.data.success === false) {
        error.response.data.fields.forEach((field: any) => {
          form.setError(field.name, {
            message: field.message,
          });
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async ({
    page = 1,
    search,
  }: {
    page: number;
    search: string;
  }) => {
    try {
      const response = await api.get("/classes", {
        params: {
          page,
          search,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.error.message || "Somthing went wrong!");
      }

      setClasses(response.data.data);
      setPagination(() => ({
        page: response.data.pagination.page,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
        nextPage: response.data.pagination.nextPage || null,
        prevPage: response.data.pagination.prevPage || null,
      }));

      toast(response.data.message || "Classes fetched successfully!");
      return response.data.data;
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate = async (data: TClassUpdate) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/classes/${selectedItem?._id}`, data);

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      fetchClasses({ page: pagination.page, search: searchQuery });

      toast(response.data.message || "Class updated successfully!");
    } catch (error: any) {
      console.log("Error: ", error);

      if (error.response.data.success === false) {
        error.response.data.fields.forEach((field: any) => {
          form.setError(field.name, {
            message: field.message,
          });
        });
      }
    } finally {
      setIsLoading(false);
      setSelectedItem(null);
      setIsEditing(false);
    }
  };

  const handleDelete = async (data: string) => {
    try {
      const response = await api.delete(`/classes/${data}`);

      if (!response.data.success) {
        throw new Error(response.data.error.message || "Somthing went wrong!");
      }

      fetchClasses({ page: pagination.page, search: searchQuery });

      toast(response.data.message || "Class deleted successfully!");
    } catch (error: any) {
      console.log("Error: ", error);

      if (error.response.data.error.message)
        toast(error.response.data.error.message);
    } finally {
      setSelectedItem(null);
      setIsDeleteOpen(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    fetchClasses({ page: pagination.page, search: searchQuery });
  }, [pagination.page, searchQuery]);

  return {
    handleDelete,
    classes,
    pagination,
    setPagination,
    search,
    setSearch,
    isLoading,
    selectedItem,
    setSelectedItem,
    form,
    handleSubmit,
    isAddOpen,
    setIsAddOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    setIsLoading,
    handleUpdate,
    isEditing,
    setIsEditing,
    fetchClasses,
  };
}

export default useClasses;
