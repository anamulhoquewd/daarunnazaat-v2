import { MONTHS } from "@/lib/utils";
import { IFeeCollection } from "@/validations";
import { UseFormReturn } from "react-hook-form";

interface Changes {
  receivedAmount?: { old: number; new: number };
  month?: { old: string; new: string };
  year?: { old: string; new: string };
}

export function useFeeFieldHandlers(
  fee: IFeeCollection | null,
  form: UseFormReturn<any>,
  setChanges: React.Dispatch<React.SetStateAction<Changes>>,
  setRemarksError: React.Dispatch<React.SetStateAction<string | null>>,
) {
  const handleReceivedAmountChange = (value: string) => {
    const newAmount = parseFloat(value) || 0;
    form.setValue("receivedAmount", newAmount, { shouldValidate: true });

    if (fee && newAmount !== fee.receivedAmount) {
      setChanges((prev) => ({
        ...prev,
        receivedAmount: { old: fee.receivedAmount, new: newAmount },
      }));
      setRemarksError(
        "Remarks are required when changing the received amount.",
      );
    } else {
      setChanges((prev) => {
        const { receivedAmount, ...rest } = prev;
        return rest;
      });
      setRemarksError("");
    }
  };

  const handleMonthChange = (value: string) => {
    const monthIndex = parseInt(value, 10);
    form.setValue("month", monthIndex, { shouldValidate: true });

    if (fee && monthIndex !== (fee.month ?? 0)) {
      setChanges((prev) => ({
        ...prev,
        month: { old: MONTHS[fee.month ?? 0], new: MONTHS[monthIndex] },
      }));
      setRemarksError("Remarks are required when changing the billing period.");
    } else {
      setChanges((prev) => {
        const { month, ...rest } = prev;
        return rest;
      });
      setRemarksError("");
    }
  };

  const handleYearChange = (value: string) => {
    const yearNum = parseInt(value, 10);
    form.setValue("year", yearNum, { shouldValidate: true });

    if (fee && yearNum !== fee.year) {
      setChanges((prev) => ({
        ...prev,
        year: { old: String(fee.year), new: String(yearNum) },
      }));
      setRemarksError("Remarks are required when changing the billing period.");
    } else {
      setChanges((prev) => {
        const { year, ...rest } = prev;
        return rest;
      });
      setRemarksError("");
    }
  };

  return {
    handleReceivedAmountChange,
    handleMonthChange,
    handleYearChange,
  };
}
