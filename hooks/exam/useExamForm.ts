import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { ExamCategory, ExamStatus, examZ, IExam } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

export const TOTAL_STEPS = 5;

export const useExamForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const form = useForm<IExam>({
    resolver: zodResolver(examZ),
    defaultValues: {
      name: "",
      type: ExamCategory.MONTHLY,
      academicYear: new Date().getFullYear().toString(),
      startDate: new Date(),
      endDate: new Date(),
      schedule: [],
      classFees: [],
      applicableClasses: [],
      subjectsByClass: [],
      status: ExamStatus.DRAFT,
    },
  });

  const classFeesArray = useFieldArray({ control: form.control, name: "classFees" });
  const subjectsByClassArray = useFieldArray({ control: form.control, name: "subjectsByClass" });
  const scheduleArray = useFieldArray({ control: form.control, name: "schedule" });

  const stepFields: Record<number, (keyof IExam)[]> = {
    1: ["name", "type", "academicYear", "startDate", "endDate"],
    2: ["applicableClasses", "classFees"],
    3: ["subjectsByClass"],
    4: [],
  };

  const nextStep = async () => {
    const fields = stepFields[step] ?? [];
    const valid = fields.length ? await form.trigger(fields as any) : true;
    if (valid) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (data: IExam) => {
    setIsLoading(true);
    try {
      await api.post("/exams", data);
      toast.success("Exam created successfully");
      router.push("/dashboard/exams");
    } catch (e) {
      handleAxiosError(e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    step,
    nextStep,
    prevStep,
    handleSubmit,
    isLoading,
    classFeesArray,
    subjectsByClassArray,
    scheduleArray,
  };
};
