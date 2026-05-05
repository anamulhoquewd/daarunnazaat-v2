"use client";

import AcademicInformation from "@/components/students/new/steps/academicInformation";
import AddressInformation from "@/components/students/new/steps/addressInformation";
import ContactInformation from "@/components/students/new/steps/contactInformation";
import FeesTab from "@/components/students/new/steps/feesTab";
import PersonalInformation from "@/components/students/new/steps/personalInformation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useStudentForm } from "@/hooks/students/useStudentForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { FormProvider } from "react-hook-form";

export default function StudentRegistrationPage() {
  const { form, handleSubmit, isLoading, clearForm } = useStudentForm();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/students">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Register Student</h1>
          <p className="text-sm text-muted-foreground">
            Add a new student — required fields are marked with *
          </p>
        </div>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
            <PersonalInformation />
            <ContactInformation />
            <AddressInformation />
            <AcademicInformation />
            <FeesTab />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={clearForm}
                disabled={isLoading}
              >
                Clear Form
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2 min-w-36">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering…
                  </>
                ) : (
                  "Register Student"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}
