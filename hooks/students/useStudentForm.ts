import api from "@/axios/intercepter";
import { stepSchemas } from "@/components/students/new/stepper";
import {
  stepFields,
  steps,
  studentFinalZ,
} from "@/components/students/new/validation";
import { handleAxiosError } from "@/lib/utils";
import { IStudent, IUpdateStudent } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export const useStudentForm = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const currentStep = steps[stepIndex];

  const isPreviewStep = currentStep === "preview";

  const resolver = useMemo(() => {
    if (isPreviewStep) return undefined;
    console.log("Currest Step: ", currentStep);
    return zodResolver(stepSchemas[stepIndex]);
  }, [stepIndex, isPreviewStep]);

  const form = useForm({
    resolver,
    shouldUnregister: false,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  console.log("Form values: ", form.getValues());

  // 🔥 STEP VALIDATION
  const validateStep = async () => {
    const fields = stepFields[currentStep];
    if (!fields.length) return true;
    return await form.trigger(fields as any);
  };

  const next = async () => {
    const valid = await validateStep();
    if (!valid) return;
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const prev = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const jumpToStepByField = (fieldName?: string) => {
    if (!fieldName) return;

    const entry = Object.entries(stepFields).find(([_, fields]) =>
      fields.includes(fieldName as any),
    );

    if (!entry) return;

    const stepIndex = steps.indexOf(entry[0] as any);
    if (stepIndex !== -1) {
      setStepIndex(stepIndex);
    }
  };

  const handleSubmit = async (data: IStudent) => {
    setIsLoading(true);

    try {
      // 🔥 FINAL FULL VALIDATION
      const parsedData = studentFinalZ.parse(data);

      // 🔥 API CALL (only if validation passed)
      const res = await api.post("/users/auth/register", parsedData);

      toast.success("Student created successfully!");

      form.reset();
      setStepIndex(0);
      onSuccess?.();
    } catch (error: any) {
      // 🟡 ZOD VALIDATION ERROR
      if (error instanceof z.ZodError) {
        error?.errors?.forEach((err) => {
          const fieldPath = err.path.join(".");
          form.setError(fieldPath as any, {
            message: err.message,
          });
        });

        // 🔥 jump to first error step (optional but recommended)
        jumpToStepByField(error.errors[0]?.path[0]);
        return;
      }

      // 🔴 API / SERVER ERROR
      handleAxiosError(error);

      if (error.response?.data?.fields) {
        error.response.data.fields.forEach((f: any) => {
          form.setError(f.name as any, { message: f.message });
        });

        // optional: jump to step
        jumpToStepByField(error.response.data.fields[0]?.name);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    stepIndex,
    currentStep,
    next,
    prev,
    handleSubmit,
    isFirst: stepIndex === 0,
    isLast: currentStep === "preview",
  };
};
