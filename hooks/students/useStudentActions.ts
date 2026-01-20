import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { IStudent } from "@/validations";
import { ContactInfo, PersonalInfo } from "@/validations/student";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useStudentActions = (onSuccess?: () => void) => {
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [student, setStudent] = useState<IStudent | null>(null);

  const getStudentById = async (studentId: string) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/students/${studentId}`);

      if (!response.data.success) {
        throw new Error(
          response.data.error.message || "Failed to delete student",
        );
      }

      onSuccess?.();

      console.log("Fetched student data:", response.data.data);

      setStudent(response.data.data);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: PersonalInfo) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/students/${id}`, data);

      if (!response.data.success) {
        toast.error("Failed to save personal info");
        throw new Error(
          response.data.error.message || "Failed to save personal info",
        );
      }

      setStudent(response.data.data);

      toast.success("Personal info saved successfully");
    } catch (error) {
      console.error("Error saving personal info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStudent = async (studentId: string) => {
    setIsLoading(true);
    try {
      const response = await api.delete(`/students/${studentId}`);

      if (!response.data.success) {
        throw new Error(
          response.data.error.message || "Failed to delete student",
        );
      }

      onSuccess?.();
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const activateStudent = async (studentId: string) => {
    setIsLoading(true);
    try {
      await api.patch(`/students/${studentId}/activate`);
      onSuccess?.();
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateStudent = async (studentId: string) => {
    setIsLoading(true);
    try {
      await api.patch(`/students/${studentId}/deactivate`);
      onSuccess?.();
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStudentById(id);
  }, [id]);

  return {
    isLoading,
    deleteStudent,
    activateStudent,
    deactivateStudent,
    getStudentById,
    student,
    handleUpdate,
  };
};
