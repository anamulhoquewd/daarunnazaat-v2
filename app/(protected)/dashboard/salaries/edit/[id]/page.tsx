"use client";

import { FeeUpdateSkeleton } from "@/components/fees/updates/feeUpdateSkeleton";
import { ChangesSummary } from "@/components/salaries/updates/changeSummary";
import { SalaryInfoCard } from "@/components/salaries/updates/salaryInfoCard";
import { SalaryFormFields } from "@/components/salaries/updates/salaryInfoFIelds";
import { SalaryNotFound } from "@/components/salaries/updates/salaryNotFound";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSalaryFieldHandlers } from "@/hooks/salaries/useSalaryFieldHandler";
import { useSalaryUpdate } from "@/hooks/salaries/useSalaryUpdates";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Form, FormProvider } from "react-hook-form";

export default function SalaryUpdatePage() {
  const router = useRouter();
  const {
    salary,
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
  } = useSalaryUpdate();

  const { handlebaseSalaryChange, handleBonusChange, handlePeriodChange } =
    useSalaryFieldHandlers(salary, form, setChanges, setRemarksError);

  const hasChanges = Object.keys(changes).length > 0;
  const remarksRequired = hasChanges && !form.watch("remarks")?.trim();

  // Loading State
  if (isLoading) {
    return <FeeUpdateSkeleton />;
  }

  // Error State
  if (!salary) {
    return <SalaryNotFound error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Update Salary Record</h1>
          <p className="text-muted-foreground">
            Carefully review and update the salary information below
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              Salary updated successfully. All balances have been recalculated.
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
        <SalaryInfoCard salary={salary} />

        {/* Editable Form */}
        <FormProvider {...form}>
          <Form {...form}>
            <form className="space-y-4">
              <SalaryFormFields
                form={form}
                changes={changes}
                remarksError={remarksError}
                onbaseSalaryChange={handlebaseSalaryChange}
                onBonusChange={handleBonusChange}
                onPeriodChange={handlePeriodChange}
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
            {isSubmitting ? "Updating..." : "Update Salary"}
          </Button>
        </div>
      </div>
    </div>
  );
}
