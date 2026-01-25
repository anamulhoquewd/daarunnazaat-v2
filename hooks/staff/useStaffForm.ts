import api from "@/axios/intercepter";
import {
  clearStorage,
  getFromStorage,
  handleAxiosError,
  saveToStorage,
  scrollToFirstError,
} from "@/lib/utils";
import { IStaff, staffZ } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const useStaffForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const isResettingRef = useRef(false);

  const savedData = getFromStorage();

  const form = useForm({
    resolver: zodResolver(staffZ),
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

  const handleSubmit = async (data: IStaff) => {
    setIsLoading(true);

    try {
      const response = await api.post("/staffs/register", data);

      if (!response.data.success) {
        throw new Error(
          response.data.error.message || "Failed to create staff",
        );
      }

      toast.success("Staff created successfully!");

      isResettingRef.current = true;
      clearForm();
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

    form.reset({
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
      userId: "",
      auternativePhone: "",
      whatsApp: "",
      firstName: "",
      lastName: "",
      dateOfBirth: null,
      gender: "",
      bloodGroup: "",
      nid: "",
      birthCertificateNumber: "",
      designation: "",
      department: "",
      joinDate: null,
      basicSalary: "",
      branch: "",
      resignationDate: null,
    });

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
