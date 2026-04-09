import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import {
  ISalaryPayment,
  IStaff,
  PaymentMethod,
  salaryPaymentZ,
} from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export interface SfattWithUser extends IStaff {
  user: {
    email: string;
    phone: string;
  };
}

export function useSalaryCenter() {
  const router = useRouter();

  const [staffs, setStaffs] = useState<SfattWithUser[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<SfattWithUser | null>(
    null,
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(salaryPaymentZ),
    defaultValues: {
      staffId: "",
      paymentMethod: PaymentMethod.CASH,
      paymentDate: new Date(),
      baseSalary: 0,
      bonus: 0,
      remarks: "",
    },
  });

  /* ---------------- SEARCH ---------------- */
  const searchStaffs = async (search: string) => {
    if (!search.trim()) {
      setStaffs([]);
      setSelectedStaff(null);
      return;
    }

    // New search should clear any previously selected student
    setSelectedStaff(null);

    setSearchLoading(true);
    try {
      const res = await api.get(`/staffs?search=${search}`);
      if (!res.data.success) throw new Error(res.data.error.message);
      setStaffs(res.data.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSearchLoading(false);
    }
  };

  /* ---------------- SELECT ---------------- */
  const selectStaff = (staff: SfattWithUser) => {
    setSelectedStaff(staff);

    form.reset({
      ...form.getValues(),
      staffId: staff._id,
    });
  };

  /* ---------------- SUBMIT ---------------- */
  const submitSalary = async (data: ISalaryPayment) => {
    if (!selectedStaff) {
      toast.error("Please select a staff member");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await api.post("/salaries/register", data);
      if (!res.data.success) throw new Error(res.data.error.message);

      toast.success("Salary submitted successfully");

      setSelectedStaff(null);
      setStaffs([]);
      form.reset({
        staffId: "",
        paymentMethod: PaymentMethod.CASH,
        paymentDate: new Date(),
        baseSalary: 0,
        bonus: 0,
        remarks: "",
      });

      toast.success(res.data.message);

      const salaryId = res.data.data._id;

      // 🔥 Redirect to invoice page
      router.push(`/dashboard/salaries/${salaryId}`);
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
      setSubmitLoading(false);
    }
  };

  return {
    /* state */
    staffs,
    selectedStaff,
    searchLoading,
    submitLoading,

    /* actions */
    searchStaffs,
    selectStaff,
    submitSalary,

    /* form */
    form,
  };
}
