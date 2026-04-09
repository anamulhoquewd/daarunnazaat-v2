import { ISalaryPayment } from "@/validations";
import { UseFormReturn } from "react-hook-form";

interface Changes {
  baseSalary?: { old: number; new: number };
  bonus?: { old: number; new: number };
  period?: { old: string; new: string }; // e.g. "2023-08"
}

export function useSalaryFieldHandlers(
  salary: ISalaryPayment | null,
  form: UseFormReturn<any>,
  setChanges: React.Dispatch<React.SetStateAction<Changes>>,
  setRemarksError: React.Dispatch<React.SetStateAction<string | null>>,
) {
  const handlebaseSalaryChange = (value: string) => {
    const newAmount = parseFloat(value) || 0;
    form.setValue("baseSalary", newAmount, { shouldValidate: true });

    if (salary && newAmount !== salary.baseSalary) {
      setChanges((prev) => ({
        ...prev,
        baseSalary: { old: salary.baseSalary, new: newAmount },
      }));
      setRemarksError(
        "Remarks are required when changing the received amount.",
      );
    } else {
      setChanges((prev) => {
        const { baseSalary, ...rest } = prev;
        return rest;
      });
      setRemarksError("");
    }
  };

  const handleBonusChange = (value: string) => {
    const newAmount = parseFloat(value) || 0;
    form.setValue("bonus", newAmount, { shouldValidate: true });

    if (salary && newAmount !== salary.bonus) {
      setChanges((prev) => ({
        ...prev,
        bonus: { old: salary.bonus, new: newAmount },
      }));
      setRemarksError(
        "Remarks are required when changing the received amount.",
      );
    } else {
      setChanges((prev) => {
        const { bonus, ...rest } = prev;
        return rest;
      });
      setRemarksError("");
    }
  };

  const handlePeriodChange = (value: string) => {
    form.setValue("period", value, { shouldValidate: true });

    if (salary && value !== salary.period) {
      setChanges((prev) => ({
        ...prev,
        period: { old: salary.period, new: value },
      }));
      setRemarksError("Remarks are required when changing the period.");
    } else {
      setChanges((prev) => {
        const { period, ...rest } = prev;
        return rest;
      });
      setRemarksError("");
    }
  };

  return {
    handlebaseSalaryChange,
    handleBonusChange,
    handlePeriodChange,
  };
}
