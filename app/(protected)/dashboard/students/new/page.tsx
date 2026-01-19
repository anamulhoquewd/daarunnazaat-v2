"use client";

import AcademicInformation from "@/components/students/new/steps/academicInformation";
import AddressInformation from "@/components/students/new/steps/addressInformation";
import ContactInformation from "@/components/students/new/steps/contactInformation";
import FeesTab from "@/components/students/new/steps/feesTab";
import PersonalInformation from "@/components/students/new/steps/personalInformation";
import PreviewStep from "@/components/students/new/steps/previewStep";
import UserSelection from "@/components/students/new/steps/userSelection";
import { steps } from "@/components/students/new/validation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentForm } from "@/hooks/students/useStudentForm";
import { FormProvider } from "react-hook-form";

export default function StudentRegistrationPage() {
  const {
    form,
    currentStep,
    stepIndex,
    handleSubmit,
    isFirst,
    isLast,
    prev,
    next,
    isLoading,
  } = useStudentForm();

  return (
    <main className="w-full flex flex-col overflow-hidden gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Student Registration
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
            <Tabs value={currentStep}>
              <TabsList className="w-full">
                {steps.map((s, i) => (
                  <TabsTrigger
                    key={s}
                    value={s}
                    disabled={i > stepIndex} // 🔥 jump blocked
                    className="capitalize"
                  >
                    {s}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="user">
                <UserSelection />
              </TabsContent>
              <TabsContent value="personal">
                <PersonalInformation />
              </TabsContent>
              <TabsContent value="contact">
                <ContactInformation />
              </TabsContent>
              <TabsContent value="address">
                <AddressInformation />
              </TabsContent>
              <TabsContent value="academic">
                <AcademicInformation />
              </TabsContent>
              <TabsContent value="fees">
                <FeesTab />
              </TabsContent>
              <TabsContent value="preview">
                <PreviewStep />
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-6">
              {!isFirst && (
                <Button type="button" variant="outline" onClick={prev}>
                  Back
                </Button>
              )}

              {!isLast ? (
                <Button type="button" onClick={next}>
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Confirm & Submit"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </FormProvider>
    </main>
  );
}
