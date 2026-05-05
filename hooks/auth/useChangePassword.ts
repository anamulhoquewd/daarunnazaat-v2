import api from "@/axios/intercepter";
import { changePasswordZ, TChangePassword } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const useChangePassword = (onClose: () => void) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TChangePassword>({
    resolver: zodResolver(changePasswordZ),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: TChangePassword) => {
    setIsLoading(true);

    try {
      const response = await api.patch("/auth/change-password", data);

      if (response.data.success) {
        form.reset({
          confirmPassword: "",
          currentPassword: "",
          newPassword: "",
        });
        toast.success("Password changed successfully");
        onClose();
      }
    } catch (error: any) {
      const fields = error?.response?.data?.error?.fields;
      if (fields?.length) {
        fields.forEach((field: any) => {
          form.setError(field.name, { message: field.message });
        });
      } else {
        toast.error(error?.response?.data?.error?.message ?? "Failed to change password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    onSubmit,
    form,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isLoading,
  };
};

export default useChangePassword;
