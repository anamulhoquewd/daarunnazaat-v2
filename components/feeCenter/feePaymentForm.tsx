"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { MONTHS } from "@/lib/utils";
import { FeeType, IStudent } from "@/validations";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { DateField } from "@/components/common/dateCalendar";

interface FeePaymentFormProps {
  selectedStudent: IStudent | null;
  form: any;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export function FeePaymentForm({
  selectedStudent,
  onSubmit,
  form,
  loading,
}: FeePaymentFormProps) {
  const feeType = form.watch("feeType");
  const balance =
    selectedStudent && feeType ? selectedStudent?.feeBalance?.[feeType] : null;

  const isSpecial = ["admissionFee", "utilityFee", "otherFee"].includes(
    feeType,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Payment Form</CardTitle>
        <CardDescription>
          {selectedStudent
            ? `Record fee payment for ${selectedStudent.firstName} ${selectedStudent.lastName}`
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
                  <div>
                    <p className="text-sm text-muted-foreground">Student ID</p>
                    <p className="font-semibold">{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="text-sm">{selectedStudent?.user.phone}</p>
                  </div>
                </div>

                {/* Fee Summary */}
                {balance && (
                  <div className="grid grid-cols-2 gap-4">
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

            {loading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Loading student details...</AlertDescription>
              </Alert>
            )}

            {/* Payment Details */}
            <div className="grid gap-4 grid-cols-2">
              <FormField
                control={form.control}
                name="feeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select fee type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(FeeType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {isSpecial ? (
                <FormField
                  control={form.control}
                  name="payableAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payable Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : (
                <MonthYearPicker form={form} />
              )}
            </div>

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

            <div className="grid gap-4 grid-cols-2">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="online">Online Transfer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DateField name="paymentDate" label="Date of Payment" />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes / Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes (optional)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about the payment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!form.watch("feeType") || form.formState.isSubmitting}
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

function MonthYearPicker({ form }: { form: any }) {
  const month = form.watch("month");
  const year = form.watch("year");

  const displayValue =
    month && year
      ? format(new Date(year, month), "MMMM yyyy")
      : "Select month & year";

  return (
    <FormItem>
      <FormLabel>Month & Year</FormLabel>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            startMonth={new Date(2020, 0)}
            endMonth={new Date(2035, 11)}
            onSelect={(date) => {
              if (!date) return;

              form.setValue("month", date.getMonth());
              form.setValue("year", date.getFullYear());
            }}
          />
        </PopoverContent>
      </Popover>

      <FormMessage />
    </FormItem>
  );
}
