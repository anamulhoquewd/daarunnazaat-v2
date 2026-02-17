import api from "@/axios/intercepter";
import { getFromStorage, handleAxiosError } from "@/lib/utils";
import { classZ, IClass } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const useClassForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDelOpen, setIsDelOpen] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(classZ),
    shouldUnregister: false,
    defaultValues: {
      className: "",
      description: "",
      monthlyFee: 0,
      capacity: 0,
      isActive: true,
    },
  });

  const handleSubmit = async (data: IClass) => {
    setIsLoading(true);

    try {
      const response = await api.post("/classes/register", data);

      if (!response.data.success) {
        throw new Error(
          response.data.error.message || "Failed to create class",
        );
      }

      toast.success("Class created successfully!");
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
