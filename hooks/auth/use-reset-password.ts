import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { resetPasswordZ, TResetPassword } from "@/validations/zod";

const useReset = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  const key = usePathname().split("/").pop() as string;

  const form = useForm<TResetPassword>({
    resolver: zodResolver(resetPasswordZ),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: TResetPassword) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.patch(`/admins/auth/reset-password/${key}`, {
        password: data.newPassword,
      });

      if (!response.data.success) {
        throw new Error(response.data?.error?.message || "Reset failed");
      }

      setIsSuccess(true);

      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 20000); // 2m
    } catch (error: any) {
      handleAxiosError(error);

      // Set form errors
      if (error.response && error.response.data) {
        const res = error.response.data;

        if (res.fields) {
          // Set form errors
          res.fields.forEach((field: { name: string; message: string }) => {
            if (field.name === "resetToken") setError(field?.message);
            form.setError(field.name as "newPassword" | "confirmPassword", {
              message: field.message,
            });
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
    isSuccess,
    error,
  };
};

export default useReset;
