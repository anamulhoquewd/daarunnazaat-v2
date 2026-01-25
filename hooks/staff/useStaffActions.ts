import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { IStaff, IUpdateStaff } from "@/validations";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useStaffActions = () => {
  const params = useParams();
  const id = params.id as string;

  const [staff, setStaff] = useState<IStaff | null>(null);
  const [loading, setLoading] = useState<{
    fetch: boolean;
    update: boolean;
    delete: boolean;
  }>({
    fetch: false,
    update: false,
    delete: false,
  });

  const getStaffById = async (staffId: string) => {
    setLoading((p) => ({ ...p, fetch: true }));
    try {
      const res = await api.get(`/staffs/${staffId}`);
      if (!res.data.success) {
        toast.error("Failed to fetch staff");
      }
      setStaff(res.data.data);
    } catch (e) {
      handleAxiosError(e);
    } finally {
      setLoading((p) => ({ ...p, fetch: false }));
    }
  };

  const handleUpdate = async (data: IUpdateStaff) => {
    if (!staff) return;

    setLoading((p) => ({ ...p, update: true }));

    try {
      const response = await api.patch(`/staffs/${id}`, data);
      if (!response.data.success) {
        toast.error("Update failed");
        throw new Error(
          response.data.error.message || "Failed to update staff",
        );
      }
      setStaff(response.data.data);
      toast.success("Updated successfully");
    } catch (e) {
      toast.error("Update failed");
      await getStaffById(id); // rollback
    } finally {
      setLoading((p) => ({ ...p, update: false }));
    }
  };

  const handleDelete = async (staffId: string) => {
    setLoading((p) => ({ ...p, delete: true }));
    try {
      const response = await api.delete(`/staffs/${staffId}`);

      if (!response.data.success) {
        toast.error(response.data.error.message || "Failed to delete staff");
        throw new Error(
          response.data.error.message || "Failed to delete staff",
        );
      }

      toast.success(
        response.data.success.message || "Staff deleted successfully",
      );
    } catch (error) {
      toast.error("An error occurred while deleting the staff.");
      handleAxiosError(error);
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  useEffect(() => {
    getStaffById(id);
  }, [id]);

  return {
    staff,
    loading,
    handleUpdate,
    getStaffById,
    handleDelete,
  };
};
