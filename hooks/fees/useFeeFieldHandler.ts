import { IFeeCollection } from "@/validations";
import { UseFormReturn } from "react-hook-form";

interface Changes {
  receivedAmount?: { old: number; new: number };
  payableAmount?: { old: number; new: number };
  period?: { old: string; new: string }; // e.g. "2023-08"
}

export function useFeeFieldHandlers(
  fee: IFeeCollection | null,
  form: UseFormReturn<any>,
  setChanges: React.Dispatch<React.SetStateAction<Changes>>,
  setRemarksError: React.Dispatch<React.SetStateAction<string | null>>,
) {
  const onReceiveAmountChange = (receivedAmount: string) => {
    const newAmount = parseFloat(receivedAmount) || 0;
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

  const onPayableAmountChange = (payableAmount: string) => {
    const newPayableAmount = parseFloat(payableAmount) || 0;
    form.setValue("payableAmount", newPayableAmount, { shouldValidate: true });

    if (fee && newPayableAmount !== fee.payableAmount) {
      setChanges((prev) => ({
        ...prev,
        payableAmount: { old: fee.payableAmount ?? 0, new: newPayableAmount },
      }));
      setRemarksError("Remarks are required when changing the payable amount.");
    } else {
      setChanges((prev) => {
        const { payableAmount, ...rest } = prev;
        return rest;
      });
      setRemarksError("");
    }
  };

  const handlePeriodChange = (value: string) => {
    form.setValue("period", value, { shouldValidate: true });

    if (fee && value !== fee.period) {
      setChanges((prev) => ({
        ...prev,
        period: { old: fee.period, new: value },
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
    handlePeriodChange,
    onReceiveAmountChange,
    onPayableAmountChange,
  };
}
