import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { ISignIn, signInZ } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const useLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/";
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ISignIn>({
    resolver: zodResolver(signInZ),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: ISignIn) => {
    // Start loading
    setIsLoading(true);

    try {
      // Send login request
      const response = await api.post("/auth/sign-in", {
        ...(data?.email?.includes("@")
          ? { email: data.email }
          : { phone: data.email }),
        password: data.password,
      });

      if (!response.data.success) {
        throw new Error(response.data?.error?.message || "Login failed");
      }

      // Clear form
      form.reset({
        email: "",
        password: "",
      });

      // Redirect to home page
      router.push(redirectTo);
    } catch (error: any) {
      // Handle error
      handleAxiosError(error);

      // Set form errors
      if (error.response && error.response.data) {
        const res = error.response.data;

        if (res.fields) {
          // Set form errors
          res.fields.forEach((field: { name: string; message: string }) => {
            form.setError(field.name as "email" | "password", {
              message: field.message,
            });
          });
        }
      }
    } finally {
      // Stop loading
      setIsLoading(false);
    }
  };

  return { form, onSubmit, isLoading };
};

export default useLogin;
