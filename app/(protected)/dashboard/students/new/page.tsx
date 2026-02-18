"use client";

import AcademicInformation from "@/components/students/new/steps/academicInformation";
import AddressInformation from "@/components/students/new/steps/addressInformation";
import ContactInformation from "@/components/students/new/steps/contactInformation";
import FeesTab from "@/components/students/new/steps/feesTab";
import PersonalInformation from "@/components/students/new/steps/personalInformation";
import UserSelection from "@/components/students/new/steps/userSelection";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useStudentForm } from "@/hooks/students/useStudentForm";
import { FormProvider } from "react-hook-form";

export default function StudentRegistrationPage() {
  const { form, handleSubmit, isLoading, clearForm } = useStudentForm();

  console.log("Form values: ", form.getValues());
  console.log("Errors: ", form.formState.errors);

  return (
    <main className="w-full flex flex-col overflow-hidden gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold">Student Registration</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Complete all sections to register for the upcoming session
        </p>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <UserSelection />
            <PersonalInformation />
            <ContactInformation />
            <AddressInformation />
            <AcademicInformation />
            <FeesTab />

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
