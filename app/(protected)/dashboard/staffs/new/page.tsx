"use client";

import Qualification from "@/components/staffs/createNew/education";
import EmergencyContact from "@/components/staffs/createNew/emergencyContact";
import { StaffInformation } from "@/components/staffs/createNew/staffInfo";
import { StaffPersonalInformation } from "@/components/staffs/createNew/staffPersonalInfo";
import { StaffUserSelection } from "@/components/staffs/createNew/userSelection";
import StaffContactInfo from "@/components/staffs/createNew/contactInfo";
import StaffAddressInfo from "@/components/staffs/createNew/addressInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useStaffForm } from "@/hooks/staff/useStaffForm";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FormProvider } from "react-hook-form";

function OptionalSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{title}</span>
            <Badge variant="secondary" className="text-xs h-4 px-1.5">
              Optional
            </Badge>
            {description && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                — {description}
              </span>
            )}
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 space-y-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export default function StaffRegistrationPage() {
  const { form, handleSubmit, isLoading, clearForm } = useStaffForm();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/staffs">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Register Staff</h1>
          <p className="text-sm text-muted-foreground">
            Add a new staff member — required fields are marked with *
          </p>
        </div>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
            {/* 1. User account link */}
            <StaffUserSelection />

            {/* 2. Personal info */}
            <StaffPersonalInformation />

            {/* 3. Staff role / salary */}
            <StaffInformation />

            {/* 4. Contact */}
            <StaffContactInfo />

            {/* 5. Address (present + permanent with copy) */}
            <StaffAddressInfo />

            <Separator className="my-2" />
            <p className="text-xs text-muted-foreground px-1">
              The sections below are optional. Expand them to fill in additional details.
            </p>

            {/* 6. Emergency contact — optional collapsible */}
            <OptionalSection
              title="Emergency Contact"
              description="person to contact in an emergency"
            >
              <EmergencyContact />
            </OptionalSection>

            {/* 7. Qualifications — optional collapsible */}
            <OptionalSection
              title="Qualifications"
              description="educational background"
            >
              <Qualification />
            </OptionalSection>

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
              <Button type="submit" disabled={isLoading} className="gap-2 min-w-32">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering…
                  </>
                ) : (
                  "Register Staff"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}
