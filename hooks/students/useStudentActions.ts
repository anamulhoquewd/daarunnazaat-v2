import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { IStudent, IUpdateStudent } from "@/validations";
import { PersonalInfo } from "@/validations/student";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useStudentActions = () => {
  const params = useParams();
  const id = params.id as string;

  const [student, setStudent] = useState<IStudent | null>(null);
  const [loading, setLoading] = useState<{
    fetch: boolean;
    update: boolean;
    delete: boolean;
  }>({
    fetch: false,
    update: false,
    delete: false,
  });

  const getStudentById = async (studentId: string) => {
    setLoading((p) => ({ ...p, fetch: true }));
    try {
      const res = await api.get(`/students/${studentId}`);
      if (!res.data.success) {
        toast.error("Failed to fetch student");
      }
      setStudent(res.data.data);
    } catch (e) {
      handleAxiosError(e);
    } finally {
      setLoading((p) => ({ ...p, fetch: false }));
    }
  };

  const handleUpdate = async (data: IUpdateStudent) => {
    if (!student) return;

    setLoading((p) => ({ ...p, update: true }));

    try {
      const response = await api.patch(`/students/${id}`, data);
      if (!response.data.success) {
        toast.error("Update failed");
        throw new Error(
          response.data.error.message || "Failed to update student",
        );
      }
      setStudent(response.data.data);
      toast.success("Updated successfully");
    } catch (e) {
      toast.error("Update failed");
      await getStudentById(id); // rollback
    } finally {
      setLoading((p) => ({ ...p, update: false }));
    }
  };

  const handleDelete = async (studentId: string) => {
    setLoading((p) => ({ ...p, delete: true }));
    try {
      const response = await api.delete(`/students/${studentId}`);

      if (!response.data.success) {
        toast.error(response.data.error.message || "Failed to delete student");
        throw new Error(
          response.data.error.message || "Failed to delete student",
        );
      }

      toast.success(
        response.data.success.message || "Student deleted successfully",
      );
    } catch (error) {
      toast.error("An error occurred while deleting the student.");
      handleAxiosError(error);
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  useEffect(() => {
    getStudentById(id);
  }, [id]);

  return {
    student,
    loading,
    handleUpdate,
    getStudentById,
    handleDelete,
  };
};
