import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { PersonalInfo } from "@/validations/student";
import { useState } from "react";
import { toast } from "sonner";

export const useStudentActions = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const getStudentById = async (studentId: string) => {
    if (!studentId) return null;

    setIsLoading(true);
    try {
      const response = await api.get(`/students/${studentId}`);

      if (!response.data.success) {
        throw new Error(
          response.data.error.message || "Failed to delete student",
        );
      }

      onSuccess?.();

      return response.data.data;
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
        toast.error(response.data.error.message || "Failed to delete student");
        throw new Error(
          response.data.error.message || "Failed to delete student",
        );
      }

      toast.success(
        response.data.success.message || "Student deleted successfully",
      );
      onSuccess?.();
    } catch (error) {
      toast.error("An error occurred while deleting the student.");
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

  return {
    isLoading,
    deleteStudent,
    activateStudent,
    deactivateStudent,
    getStudentById,
    handleUpdate,
  };
};
