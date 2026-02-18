"use client";

import { StaffInformation } from "@/components/staffs/createNew/staffInfo";
import { StaffPersonalInformation } from "@/components/staffs/createNew/staffPersonalInfo";
import { StaffUserSelection } from "@/components/staffs/createNew/userSelection";
import AddressInformation from "@/components/students/new/steps/addressInformation";
import ContactInformation from "@/components/students/new/steps/contactInformation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useStaffForm } from "@/hooks/staff/useStaffForm";
import { FormProvider } from "react-hook-form";

export default function StaffRegistrationPage() {
  const { form, handleSubmit, isLoading, clearForm } = useStaffForm();

  return (
    <main className="w-full flex flex-col overflow-hidden gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Staff Registration
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Complete all sections to register for the upcoming session
        </p>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <StaffUserSelection />
            <StaffPersonalInformation />
            <ContactInformation />
            <AddressInformation />
            <StaffInformation />

            <div className="flex justify-end pt-6 gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={clearForm}
                className="cursor-pointer"
              >
                Clear
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading ? "Submitting..." : "Confirm & Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </main>
  );
}
