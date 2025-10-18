import api from "@/axios/intercepter";
import { IAdmin } from "@/interfaces";
import { adminUpdateZ, TAdminUpdate } from "@/validations/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function useMe() {
  const [user, setUser] = useState<IAdmin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordOpen, setpasswordOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(adminUpdateZ),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const fetchMe = async () => {
    try {
      const response = await api.get("/admins/me");

      if (!response.data.success) {
        throw new Error(response.data.error.message || "Something with wrong!");
      }

      setUser(response.data.data);
    } catch (error: any) {
      console.log("Error: ", error);
    }
  };

  const handleUpdate = async (data: TAdminUpdate) => {
    setIsLoading(true);
    try {
      const response = await api.patch("/admins/auth/me", data);

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      fetchMe();
      setIsEditing(false);

      toast(response.data.message || "Admin updated successfully!");
    } catch (error: any) {
      console.log("Error: ", error);

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

  const handleLogout = async () => {
    try {
      const response = await api.post("/admins/auth/sign-out");

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      toast(response.data.message);

      router.push("/auth/sign-in");
    } catch (error: any) {
      console.log("Error: ", error);

      if (error.response.data.error.message)
        toast(error.response.data.error.message);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        phone: user.phone,
        address: user.address,
        join_date: user.join_date,
      });
    }
  }, [user, form]);

  return {
    user,
    handleUpdate,
    form,
    isLoading,
    setIsLoading,
    passwordOpen,
    setpasswordOpen,
    isEditing,
    setIsEditing,
    handleLogout,
  };
}

export default useMe;
