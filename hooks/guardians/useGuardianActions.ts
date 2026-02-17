import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { IGuardian, IUpdateGuardian } from "@/validations";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useGuardianActions = () => {
  const params = useParams();
  const id = params.id as string;

  const [guardian, setGuardian] = useState<IGuardian | null>(null);
  const [loading, setLoading] = useState<{
    fetch: boolean;
    update: boolean;
    delete: boolean;
  }>({
    fetch: false,
    update: false,
    delete: false,
  });

  const getGuardianById = async (guardianId: string) => {
    setLoading((p) => ({ ...p, fetch: true }));
    try {
      const res = await api.get(`/guardians/${guardianId}`);
      if (!res.data.success) {
        toast.error("Failed to fetch guardian");
      }
      setGuardian(res.data.data);
    } catch (e) {
      handleAxiosError(e);
    } finally {
      setLoading((p) => ({ ...p, fetch: false }));
    }
  };

  const handleUpdate = async (data: IUpdateGuardian) => {
    if (!guardian) return;

    setLoading((p) => ({ ...p, update: true }));

    try {
      const response = await api.patch(`/guardians/${id}`, data);
      if (!response.data.success) {
        toast.error("Update failed");
        throw new Error(
          response.data.error.message || "Failed to update guardian",
        );
      }
      setGuardian(response.data.data);
      toast.success("Updated successfully");
    } catch (e) {
      toast.error("Update failed");
      await getGuardianById(id); // rollback
    } finally {
      setLoading((p) => ({ ...p, update: false }));
    }
  };

  const handleDelete = async (guardianId: string) => {
    setLoading((p) => ({ ...p, delete: true }));
    try {
      const response = await api.delete(`/guardians/${guardianId}`);

      if (!response.data.success) {
        toast.error(response.data.error.message || "Failed to delete guardian");
        throw new Error(
          response.data.error.message || "Failed to delete guardian",
        );
      }

      toast.success(
        response.data.success.message || "guardian deleted successfully",
      );
    } catch (error) {
      toast.error("An error occurred while deleting the guardian.");
      handleAxiosError(error);
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  useEffect(() => {
    getGuardianById(id);
  }, [id]);

  return {
    guardian,
    loading,
    handleUpdate,
    getGuardianById,
    handleDelete,
  };
};
