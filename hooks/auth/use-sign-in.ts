import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { setStorage } from "@/store/local";
import { signInSchemeZ, TSignIn } from "@/validations/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const useLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/";
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TSignIn>({
    resolver: zodResolver(signInSchemeZ),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: TSignIn) => {
    // Start loading
    setIsLoading(true);

    try {
      // Send login request
      const response = await api.post(`/admins/auth/sign-in`, {
        ...(data?.email?.includes("@")
          ? { email: data.email }
          : { phone: data.email }),
        password: data.password,
      });

      // if response is successful

      if (!response.data.success) {
        throw new Error(response.data?.error?.message || "Login failed");
      }
      // Set access token
      const accessToken = response.data.tokens.accessToken;

      // Set access token in local storage
      setStorage("accessToken", accessToken);

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
