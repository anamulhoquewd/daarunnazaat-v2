import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import {
  feeCollectionsUpdateZ,
  IFeeCollection,
  IStudent,
  PaymentMethod,
  PaymentSource,
} from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function useFeeReceiveCenter() {
  const [students, setStudents] = useState<IStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(feeCollectionsUpdateZ),
    defaultValues: {
      studentId: "",
      paymentMethod: PaymentMethod.CASH,
      paymentDate: new Date(),
      receivedAmount: 0,
      paymentSource: PaymentSource.OFFICE,
      remarks: "",
    },
  });

  console.log("Form values: ", form.getValues());
  console.log("Errors: ", form.formState.errors);

  /* ---------------- SEARCH ---------------- */
  const searchStudents = async (search: string) => {
    if (!search.trim()) {
      setStudents([]);
      setSelectedStudent(null);
      return;
    }

    // New search should clear any previously selected student
    setSelectedStudent(null);

    setSearchLoading(true);
    try {
      const res = await api(`/students?search=${search}`);
      if (!res.data.success) throw new Error(res.data.error.message);
      setStudents(res.data.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSearchLoading(false);
    }
  };

  /* ---------------- SELECT ---------------- */
  const selectStudent = (student: IStudent) => {
    setSelectedStudent(student);

    form.reset({
      ...form.getValues(),
      studentId: student._id,
    });
  };

  /* ---------------- SUBMIT ---------------- */
  const submitFee = async (data: IFeeCollection) => {
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }

    console.log("Data: ", data);
    // return;

    setSubmitLoading(true);
    try {
      const res = await api.post("/fees/register", data);
      if (!res.data.success) throw new Error(res.data.error.message);

      toast.success("Fee received successfully");

      setSelectedStudent(null);
      setStudents([]);
      form.reset();

      console.log("Res: ", res);
      toast.success(res.data.message);
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
    students,
    selectedStudent,
    searchLoading,
    submitLoading,

    /* actions */
    searchStudents,
    selectStudent,
    submitFee,

    /* form */
    form,
  };
}
