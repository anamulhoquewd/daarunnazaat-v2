"use client";

import { Step1BasicInfo } from "@/components/exam/createNew/step1BasicInfo";
import { Step2ClassesFees } from "@/components/exam/createNew/step2ClassesFees";
import { Step3Subjects } from "@/components/exam/createNew/step3Subjects";
import { Step4Schedule } from "@/components/exam/createNew/step4Schedule";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useExamForm, TOTAL_STEPS } from "@/hooks/exam/useExamForm";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { FormProvider } from "react-hook-form";

const STEPS = [
  { label: "Basic Info" },
  { label: "Classes & Fees" },
  { label: "Subjects" },
  { label: "Schedule" },
  { label: "Review" },
];

export default function CreateExamPage() {
  const { form, step, nextStep, prevStep, handleSubmit, isLoading } =
    useExamForm();

  const values = form.watch();

  return (
    <main className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
        <p className="text-gray-500 text-sm">
          Complete all steps to create the exam and auto-enroll students.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const idx = i + 1;
          const done = idx < step;
          const active = idx === step;
          return (
            <div key={idx} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors",
                    done
                      ? "bg-primary border-primary text-primary-foreground"
                      : active
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : idx}
                </div>
                <span
                  className={cn(
                    "text-xs hidden sm:block",
                    active ? "text-primary font-medium" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mb-4 transition-colors",
                    done ? "bg-primary" : "bg-muted-foreground/20",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form */}
      <FormProvider {...form}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="bg-card border rounded-xl p-6 shadow-sm space-y-6"
          >
            {step === 1 && <Step1BasicInfo />}
            {step === 2 && <Step2ClassesFees />}
            {step === 3 && <Step3Subjects />}
            {step === 4 && <Step4Schedule />}
            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Review & Submit</h2>
                <div className="rounded-md border divide-y text-sm">
                  <Row label="Name" value={values.name} />
                  <Row label="Type" value={values.type} />
                  <Row label="Academic Year" value={values.academicYear} />
                  <Row
                    label="Start Date"
                    value={
                      values.startDate
                        ? new Date(values.startDate).toLocaleDateString()
                        : "-"
                    }
                  />
                  <Row
                    label="End Date"
                    value={
                      values.endDate
                        ? new Date(values.endDate).toLocaleDateString()
                        : "-"
                    }
                  />
                  <Row
                    label="Classes"
                    value={`${(values.applicableClasses ?? []).length} selected`}
                  />
                  <Row
                    label="Subject configs"
                    value={`${(values.subjectsByClass ?? []).length} class(es) configured`}
                  />
                  <Row
                    label="Schedule entries"
                    value={`${(values.schedule ?? []).length} entries`}
                  />
                  <Row label="Status" value={values.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  On submit, all active students of the selected classes will be
                  auto-enrolled with the configured exam fee.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < TOTAL_STEPS ? (
                <Button type="button" onClick={nextStep}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Exam"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </FormProvider>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "-"}</span>
    </div>
  );
}
