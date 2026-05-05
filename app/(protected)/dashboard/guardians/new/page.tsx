"use client";

import GuardianAddressInfo from "@/components/guardians/new/addressInfo";
import GuardianContactInfo from "@/components/guardians/new/contactInfo";
import GuardianPersonalInformation from "@/components/guardians/new/guardianPersonalInfo";
import GuardianUserSelection from "@/components/guardians/new/userSelection";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGuardianForm } from "@/hooks/guardians/useGuardian";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { FormProvider } from "react-hook-form";

export default function GuardianRegistrationPage() {
  const { form, handleSubmit, isLoading, clearForm } = useGuardianForm();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/guardians">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Register Guardian
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new guardian — required fields are marked with *
          </p>
        </div>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit as any)}
            className="space-y-4"
          >
            {/* 1. User account link */}
            <GuardianUserSelection />

            {/* 2. Personal info */}
            <GuardianPersonalInformation />

            {/* 3. Contact */}
            <GuardianContactInfo />

            {/* 4. Address */}
            <GuardianAddressInfo />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={clearForm}
                disabled={isLoading}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="gap-2 min-w-36"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering…
                  </>
                ) : (
                  "Register Guardian"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}
