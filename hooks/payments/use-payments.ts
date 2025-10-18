import api from "@/axios/intercepter";
import { IPagination, IPayment } from "@/interfaces";
import { defaultPagination } from "@/lib/utils";
import {
  paymentCreateZ,
  TPaymentCreate,
  TPaymentUpdate,
} from "@/validations/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useMe from "@/hooks/auth/use-me";

function usePayments() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<IPayment | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [payments, setPayments] = useState<IPayment[] | []>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);

  const { user } = useMe();

  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(paymentCreateZ),
    defaultValues: {
      amount: 0,
      year: 2025,
      paid_at: new Date(),
    },
  });

  // Form submission
  const handleSubmit = async (data: TPaymentCreate) => {
    setIsLoading(true);

    try {
      const response = await api.post("/payments/register", {
        ...data,
        admin_id: user?._id,
      });

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      form.reset({
        amount: 0,
        year: 2025,
        paid_at: new Date(),
      });

      fetchPayments({ page: pagination.page, search: searchQuery });

      toast(response.data.message || "Payment created successfully!");
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

  const fetchPayments = async ({
    page = 1,
    search,
  }: {
    page: number;
    search: string;
  }) => {
    try {
      const response = await api.get("/payments", {
        params: {
          page,
          search,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.error.message || "Somthing went wrong!");
      }

      setPayments(response.data.data);
      setPagination(() => ({
        page: response.data.pagination.page,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
        nextPage: response.data.pagination.nextPage || null,
        prevPage: response.data.pagination.prevPage || null,
      }));

      toast(response.data.message || "payments fetched successfully!");
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate = async (data: TPaymentUpdate) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/payments/${selectedItem?._id}`, data);

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      fetchPayments({ page: pagination.page, search: searchQuery });

      toast(response.data.message || "Payment updated successfully!");
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
      const response = await api.delete(`/payments/${data}`);

      if (!response.data.success) {
        throw new Error(response.data.error.message || "Somthing went wrong!");
      }

      fetchPayments({ page: pagination.page, search: searchQuery });

      toast(response.data.message || "Payment deleted successfully!");
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
    fetchPayments({ page: pagination.page, search: searchQuery });
  }, [pagination.page, searchQuery]);

  return {
    handleDelete,
    payments,
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

export default usePayments;
