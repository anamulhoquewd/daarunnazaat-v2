"use client";

import api from "@/axios/intercepter";
import {
  ISalaryPayment,
  ISalaryPaymentUpdate,
  PaymentMethod,
  salaryPaymentUpdateZ,
} from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Changes {
  baseSalary?: { old: number; new: number };
  bonus?: { old: number; new: number };
  period?: { old: string; new: string };
}

export function useSalaryUpdate() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [salary, setSalary] = useState<ISalaryPayment | null>(null);
  const [changes, setChanges] = useState<Changes>({});
  const [remarksError, setRemarksError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(salaryPaymentUpdateZ),
    defaultValues: {
      baseSalary: 0,
      bonus: 0,
      paymentDate: new Date(),
      paymentMethod: "cash" as PaymentMethod,
      remarks: "",
      period: "",
    },
  });

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchSalary = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get(`/salaries/${id}`);

        if (!response.data.success) {
          toast.error(response.data?.error?.message | response.data.message);
          throw new Error(response.data.error.message);
        }

        const salaryData = response.data.data;
        setSalary(salaryData);

        form.reset({
          baseSalary: salaryData.baseSalary || 0,
          bonus: salaryData.bonus || 0,
          paymentDate: salaryData.paymentDate || new Date(),
          paymentMethod: salaryData.paymentMethod || "",
          remarks: salaryData.remarks || "",
          period: salaryData.period || "",
        });

        toast.success(response.data.message);
      } catch (err: any) {
        toast.error(err.response?.data?.message);
        setError(err instanceof Error ? err.message : "An error occurred");
        throw new Error(`Error: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalary();
  }, [id, form]);

  const handleSubmit = async (data: ISalaryPaymentUpdate) => {
    const hasChanges = Object.keys(changes).length > 0;
    const remarksRequired = hasChanges && !data.remarks?.trim();

    if (remarksRequired) {
      setRemarksError("Remarks are required for this change.");
      form.setError("remarks", {
        message: "Remarks are required for this change.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        baseSalary: data.baseSalary,
        bonus: data.bonus,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        period: data.period,
        remarks: data.remarks,
      };

      const response = await api.patch(`/salaries/${id}`, payload);

      if (!response.data.success) {
        throw new Error(
          response.data.error?.message || "Failed to update salary",
        );
      }

      toast.success(response.data.message || "Salary updated successfully!");

      setSuccessMessage(true);

      form.reset({
        baseSalary: 0,
        bonus: 0,
        paymentDate: new Date(),
        paymentMethod: "cash" as PaymentMethod,
        remarks: "",
        period: "",
      });

      setTimeout(() => {
        setSuccessMessage(false);
        window.history.back();
      }, 2000);
    } catch (err: any) {
      if (err.code === 11000) {
        toast.error("A salary already exists for this period.");
        setError("A salary already exists for this period.");
        throw new Error("Error: " + "A salary already exists for this period.");
      }

      setError(
        err instanceof Error ? err.message : "An error occurred while updating",
      );
      if (err.response?.data?.fields?.length) {
        err.response.data.fields.forEach((f: any) => {
          form.setError(f.name as any, {
            message: f.message,
          });
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    salary,
    changes,
    setChanges,
    remarksError,
    setRemarksError,
    error,
    successMessage,
    isLoading,
    isSubmitting,
    form,
    handleSubmit,
  };
}
