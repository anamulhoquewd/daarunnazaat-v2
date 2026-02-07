"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { IFeeCollection, PaymentMethod } from "@/validations";
import { feeUpdateSchema } from "@/validations/student";
import api from "@/axios/intercepter";

interface Changes {
  receivedAmount?: { old: number; new: number };
  month?: { old: string; new: string };
  year?: { old: string; new: string };
}

export function useFeeUpdate() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [fee, setFee] = useState<IFeeCollection | null>(null);
  const [changes, setChanges] = useState<Changes>({});
  const [remarksError, setRemarksError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(feeUpdateSchema),
    defaultValues: {
      receivedAmount: 0,
      paymentDate: new Date(),
      paymentMethod: "cash" as PaymentMethod,
      remarks: "",
      month: 0,
      year: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchFee = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get(`/fees/${id}`);

        if (!response.data.success) {
          toast.error(response.data?.error?.message | response.data.message);
          throw new Error(response.data.error.message);
        }

        const feeData = response.data.data;
        setFee(feeData);

        form.reset({
          receivedAmount: feeData.receivedAmount || 0,
          paymentDate: feeData.paymentDate || new Date(),
          paymentMethod: feeData.paymentMethod || "",
          remarks: feeData.remarks || "",
          month: feeData.month ?? 0,
          year: feeData.year ?? new Date().getFullYear(),
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

    fetchFee();
  }, [id, form]);

  const handleSubmit = async (data: any) => {
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
        receivedAmount: data.receivedAmount,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        month:
          typeof data.month === "string"
            ? parseInt(data.month, 10)
            : data.month,
        year:
          typeof data.year === "string" ? parseInt(data.year, 10) : data.year,
        remarks: data.remarks,
      };

      const response = await api.patch(`/fees/${id}`, payload);

      if (!response.data.success) {
        throw new Error(response.data.error?.message || "Failed to update fee");
      }

      toast.success(response.data.message || "Fee updated successfully!");

      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        window.history.back();
      }, 2000);
    } catch (err: any) {
      if (err.code === 11000) {
        toast.error("A fee already exists for this month and year.");
        setError("A fee already exists for this month and year.");
        throw new Error(
          "Error: " + "A fee already exists for this month and year.",
        );
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
    fee,
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
