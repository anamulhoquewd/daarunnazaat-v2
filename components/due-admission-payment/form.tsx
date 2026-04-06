"use client";

import { DateField } from "@/components/common/dateCalendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FeeType, IStudent, PaymentMethod } from "@/validations";
import { IStudentPopulated } from "@/validations/student";
import { Loader2 } from "lucide-react";

interface FeePaymentFormProps {
  selectedStudent: IStudentPopulated | null;
  form: any;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export function DuePaymentForm({
  selectedStudent,
  onSubmit,
  form,
}: FeePaymentFormProps) {
  const balance = selectedStudent
    ? selectedStudent?.feeBalance?.[
        "admissionFee" as keyof typeof selectedStudent.feeBalance
      ]
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Due Payment Form</CardTitle>
        <CardDescription>
          {selectedStudent
            ? `Record fee payment for ${selectedStudent.fullName}`
            : "Select a student to record their fee payment"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
            {/* Student Info */}
            {selectedStudent && (
              <>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Student Name
                      </p>
                      <p className="font-semibold">
                        {`${selectedStudent.fullName}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Student ID
                      </p>
                      <p className="font-semibold">
                        {selectedStudent.studentId}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="text-sm">
                        {selectedStudent?.phone ||
                          selectedStudent?.whatsApp ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-sm">
                        {selectedStudent?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fee Summary */}
                {balance && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-green-50 border rounded">
                      <p className="text-xs capitalize">Admission Fee</p>
                      <p className="font-semibold">
                        {selectedStudent["admissionFee" as keyof IStudent] ??
                          "Unconfigured"}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 border rounded">
                      <p className="text-xs">Advance</p>
                      <p className="font-semibold">{balance.advance}</p>
                    </div>
                    <div className="p-3 bg-red-50 border rounded">
                      <p className="text-xs">Due</p>
                      <p className="font-semibold">{balance.due}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            <FormField
              control={form.control}
              name="receivedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Received Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100"
                      min="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || undefined)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the amount received from student
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!form.watch("receivedAmount") || form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {form.formState.isSubmitting
                ? "Recording Payment..."
                : "Record Payment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
