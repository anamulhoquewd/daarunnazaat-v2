"use client";

import { FormProvider, Form } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useFeeUpdate } from "@/hooks/fees/useFeeUpdates";
import { useFeeFieldHandlers } from "@/hooks/fees/useFeeFieldHandler";
import { FeeUpdateSkeleton } from "@/components/fees/updates/feeUpdateSkeleton";
import { FeeNotFound } from "@/components/fees/updates/feeNotFound";
import { FeeInfoCard } from "@/components/fees/updates/feeInfoCard";
import { FeeFormFields } from "@/components/fees/updates/feeInfoFIelds";
import { ChangesSummary } from "@/components/fees/updates/changeSummary";
import { useRouter } from "next/navigation";
export default function FeeUpdatePage() {
  const router = useRouter();
  const {
    fee,
    changes,
    setChanges,
    remarksError,
    setRemarksError,
    error,
    successMessage,
    isLoading,
    isSubmitting,
    form,
    handleSubmit,
  } = useFeeUpdate();

  const { handleReceivedAmountChange, handleMonthChange, handleYearChange } =
    useFeeFieldHandlers(fee, form, setChanges, setRemarksError);

  const hasChanges = Object.keys(changes).length > 0;
  const remarksRequired = hasChanges && !form.getValues("remarks")?.trim();

  // Loading State
  if (isLoading) {
    return <FeeUpdateSkeleton />;
  }

  // Error State
  if (!fee) {
    return <FeeNotFound error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Update Fee Record</h1>
          <p className="text-muted-foreground">
            Carefully review and update the fee information below
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              Fee updated successfully. All balances have been recalculated.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="bg-rose-50 border-rose-200 text-rose-900">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <AlertDescription className="text-rose-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Read-Only Info */}
        <FeeInfoCard fee={fee} />

        {/* Editable Form */}
        <FormProvider {...form}>
          <Form {...form}>
            <form className="space-y-4">
              <FeeFormFields
                form={form}
                changes={changes}
                remarksError={remarksError}
                onReceivedAmountChange={handleReceivedAmountChange}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
              />
            </form>
          </Form>
        </FormProvider>

        {/* Changes Summary */}
        <ChangesSummary changes={changes} />

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={remarksRequired || isSubmitting}
            onClick={form.handleSubmit(handleSubmit)}
          >
            {isSubmitting ? "Updating..." : "Update Fee"}
          </Button>
        </div>
      </div>
    </div>
  );
}
