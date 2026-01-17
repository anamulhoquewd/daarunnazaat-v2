import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { IStudent, studentZ } from "@/validations";
import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";

export const useStudentForm = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<IStudent>({
    resolver: zodResolver(studentZ),
    defaultValues: {
      firstName: "",
      lastName: "",
      fatherName: "",
      motherName: "",
      nid: "",
      birthCertificateNumber: "",
      guardianId: "",
      userId: "",
      currentSessionId: "",
      admissionFee: 0,
      monthlyFee: 0,
      isResidential: true,
      isMealIncluded: true,
      mealFee: 0,
      admissionDiscount: 0,
      classId: "",
    },
  });

  const createStudent = async () => {
    setIsLoading(true);
    try {
      const res = await api.post("/users/auth/register", form.getValues());

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      handleAxiosError(error);

      if (error.response?.data?.fields) {
        error.response.data.fields.forEach((field: any) => {
          form.setError(field.name, { message: field.message });
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudent = async (studentId: string) => {
    setIsLoading(true);
    try {
      const res = await api.patch(`/students/${studentId}`, form.getValues());

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      handleAxiosError(error);

      if (error.response?.data?.fields) {
        error.response.data.fields.forEach((field: any) => {
          form.setError(field.name, { message: field.message });
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    createStudent,
    updateStudent,
  };
};
