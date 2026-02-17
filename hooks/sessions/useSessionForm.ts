import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { ISession, sessionZ } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const useSessionForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDelOpen, setIsDelOpen] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(sessionZ),
    shouldUnregister: false,
    defaultValues: {
      sessionName: "",
      isActive: true,
      startDate: undefined,
      endDate: undefined,
      batchType: undefined,
    },
  });

  const handleSubmit = async (data: ISession) => {
    setIsLoading(true);

    try {
      const response = await api.post("/sessions/register", data);

      if (!response.data.success) {
        throw new Error(
          response.data.error.message || "Failed to create session",
        );
      }

      toast.success("Session created successfully!");
    } catch (error: any) {
      handleAxiosError(error);

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

  return {
    form,
    isLoading,
    handleSubmit,
    setIsDelOpen,
    isDelOpen,
  };
};
