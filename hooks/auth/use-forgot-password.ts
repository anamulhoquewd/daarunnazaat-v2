import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordZ, TForgotPassowrd } from "@/validations/zod";
import { useState } from "react";
import api from "@/axios/intercepter";

const useForgot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [value, setValue] = useState("");

  const form = useForm<TForgotPassowrd>({
    resolver: zodResolver(forgotPasswordZ),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async () => {
    // Start loading
    setIsLoading(true);

    try {
      const response = await api.post(
        `/admins/auth/forgot-password`,
        form.getValues()
      );

      if (!response.data.success) {
        throw new Error(response.data?.error?.message || "Forgot failed");
      }

      setIsSuccess(true);
      setValue(response.data.data);
      form.reset({
        email: "",
      });
    } catch (error: any) {
      const res = error.response.data;

      if (res.fields) {
        res.fields.forEach((field: { name: string; message: string }) => {
          form.setError(field.name as "email", {
            message: field.message,
          });
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { onSubmit, form, value, isSuccess, isLoading };
};

export default useForgot;

// export type UseForgot = ReturnType<typeof useForgot>;
