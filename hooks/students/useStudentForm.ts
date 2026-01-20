import api from "@/axios/intercepter";
import {
  clearStorage,
  getFromStorage,
  handleAxiosError,
  saveToStorage,
  scrollToFirstError,
} from "@/lib/utils";
import { IStudent, studentZ } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const useStudentForm = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const isResettingRef = useRef(false);

  const savedData = getFromStorage();

  const form = useForm<IStudent>({
    resolver: zodResolver(studentZ),
    shouldUnregister: false,
    defaultValues: savedData ?? {
      presentAddress: {
        village: "",
        postOffice: "",
        upazila: "",
        district: "",
        division: "",
      },
      permanentAddress: {
        village: "",
        postOffice: "",
        upazila: "",
        district: "",
        division: "",
      },
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    if (isResettingRef.current) return;

    const timeout = setTimeout(() => {
      saveToStorage(watchedValues);
    }, 400);

    return () => clearTimeout(timeout);
  }, [watchedValues]);

  const handleSubmit = async (data: IStudent) => {
    setIsLoading(true);

    try {
      // 🔥 ZOD already validated here
      const response = await api.post("/students/register", data);

      if (!response.data.data.success) {
        throw new Error("Failed to create student");
      }

      toast.success("Student created successfully!");

      isResettingRef.current = true;
      form.reset();
      clearStorage();

      setTimeout(() => {
        isResettingRef.current = false;
      }, 0);
    } catch (error: any) {
      handleAxiosError(error);

      // 🔥 AUTO SCROLL TO FIRST ERROR
      const firstErrorField = scrollToFirstError(form.formState.errors);

      if (firstErrorField) {
        setTimeout(() => {
          const el = document.querySelector(
            `[name="${firstErrorField}"]`,
          ) as HTMLElement | null;

          el?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          el?.focus();
        }, 100);
      }

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

  const clearForm = () => {
    isResettingRef.current = true;

    form.reset();

    clearStorage();

    // next tick এ আবার auto-save চালু
    setTimeout(() => {
      isResettingRef.current = false;
    }, 0);
  };

  return {
    form,
    isLoading,
    handleSubmit,
    clearForm,
  };
};
