import api from "@/axios/intercepter";
import { IPagination, IStudent } from "@/interfaces";
import { defaultPagination } from "@/lib/utils";
import {
  studentCreateZ,
  TStudentCreate,
  TStudentUpdate,
} from "@/validations/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function useStudents() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<IStudent | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [students, setStudents] = useState<IStudent[] | []>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);

  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(studentCreateZ),
    defaultValues: {
      name: "",
      admission_date: new Date(),
      address: "",
      class_id: "",
      date_of_birth: new Date(),
      guardian_name: "",
      guardian_phone: "",
      id_card: "",
      is_active: true,
      monthly_fee: 0,
      roll: 0,
    },
  });

  // Form submission
  const handleSubmit = async (data: TStudentCreate) => {
    setIsLoading(true);

    try {
      const response = await api.post("/students/register", data);

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      form.reset({
        name: "",
        admission_date: new Date(),
        address: "",
        class_id: "",
        date_of_birth: new Date("2002-03-30"),
        guardian_name: "",
        guardian_phone: "",
        id_card: "",
        is_active: true,
        monthly_fee: 0,
        roll: 0,
      });

      fetchStudents({ page: pagination.page, search: searchQuery });

      toast(response.data.message || "Student created successfully!");
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

  const fetchStudents = async ({
    page = 1,
    search,
  }: {
    page: number;
    search: string;
  }) => {
    try {
      const response = await api.get("/students", {
        params: {
          page,
          search,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.error.message || "Somthing went wrong!");
      }

      setStudents(response.data.data);
      setPagination(() => ({
        page: response.data.pagination.page,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
        nextPage: response.data.pagination.nextPage || null,
        prevPage: response.data.pagination.prevPage || null,
      }));

      toast(response.data.message || "Students fetched successfully!");
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate = async (data: TStudentUpdate) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/students/${selectedItem?._id}`, data);

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      fetchStudents({ page: pagination.page, search: searchQuery });

      toast(response.data.message || "Student updated successfully!");
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
      const response = await api.delete(`/students/${data}`);

      if (!response.data.success) {
        throw new Error(response.data.error.message || "Somthing went wrong!");
      }

      fetchStudents({ page: pagination.page, search: searchQuery });

      toast(response.data.message || "Student deleted successfully!");
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
    fetchStudents({ page: pagination.page, search: searchQuery });
  }, [pagination.page, searchQuery]);

  return {
    handleDelete,
    students,
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

export default useStudents;
