import api from "@/axios/intercepter";
import { changePasswordZ, TChangePassowrd } from "@/validations/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

const useChangePassword = (onClose: () => void) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TChangePassowrd>({
    resolver: zodResolver(changePasswordZ),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: TChangePassowrd) => {
    setIsLoading(true);

    try {
      const response = await api.patch("/admins/auth/change-password", data);

      if (response.data.success) {
        form.reset({
          confirmPassword: "",
          currentPassword: "",
          newPassword: "",
        });
        console.log("Password changed successfully");
        onClose();
      }
    } catch (error: any) {
      console.error(error);

      if (error.response.data.success === false) {
        error.response.data.fields.forEach((field: any) => {
          form.setError(field.name, {
            message: field.message,
          });
        });
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
