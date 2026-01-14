import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { useState } from "react";

export const useStudentActions = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteStudent = async (studentId: string) => {
    setIsLoading(true);
    try {
      const res = await api.delete(`/students/${studentId}`);

      if (!res.data.success) {
        throw new Error(res.data.error.message);
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

  return {
    isLoading,
    deleteStudent,
    activateStudent,
    deactivateStudent,
  };
};
