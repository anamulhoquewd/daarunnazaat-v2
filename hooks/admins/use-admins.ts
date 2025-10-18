import api from "@/axios/intercepter";
import { IAdmin, IPagination } from "@/interfaces";
import { defaultPagination } from "@/lib/utils";
import { adminCreateZ, TAdminCreate, TAdminUpdate } from "@/validations/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function useAdmins() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<IAdmin | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [admins, setAdmins] = useState<IAdmin[] | []>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);

  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(adminCreateZ),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      is_active: true,
      join_date: new Date(),
      address: "",
      designation: "",
    },
  });

  // Form submission
  const handleSubmit = async (data: TAdminCreate) => {
    setIsLoading(true);

    try {
      const response = await api.post("/admins/auth/register", data);

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      form.reset({
        name: "",
        email: "",
        phone: "",
        is_active: true,
        is_blocked: false,
        join_date: new Date(),
        address: "",
        designation: "",
      });

      fetchAdmins({ page: pagination.page, search: searchQuery });

      toast(response.data.message || "Admin created successfully!");
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

  const fetchAdmins = async ({
    page = 1,
    search,
  }: {
    page: number;
    search: string;
  }) => {
    try {
      const response = await api.get("/admins", {
        params: {
          page,
          search,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.error.message || "Somthing went wrong!");
      }

      setAdmins(response.data.data);
      setPagination(() => ({
        page: response.data.pagination.page,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
        nextPage: response.data.pagination.nextPage || null,
        prevPage: response.data.pagination.prevPage || null,
      }));

      toast(response.data.message || "Admins fetched successfully!");
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate = async (data: TAdminUpdate) => {
    setIsLoading(true);
    try {
      const response = await api.patch(
        `/admins/auth/${selectedItem?._id}`,
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      fetchAdmins({ page: pagination.page, search: searchQuery });

      toast(response.data.message || "Admin updated successfully!");
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
      const response = await api.delete(`/admins/auth/${data}`);

      if (!response.data.success) {
        throw new Error(response.data.error.message || "Somthing went wrong!");
      }

      fetchAdmins({ page: pagination.page, search: searchQuery });

      toast(response.data.message || "Admin deleted successfully!");
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
    fetchAdmins({ page: pagination.page, search: searchQuery });
  }, [pagination.page, searchQuery]);

  return {
    handleDelete,
    admins,
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
  };
}

export default useAdmins;
