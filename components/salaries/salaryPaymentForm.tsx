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
import { Branch, IStaff, PaymentMethod } from "@/validations";
import { Loader2 } from "lucide-react";
import { PeriodPicker } from "../common/datePeriod";
import { SfattWithUser } from "@/hooks/salaries/useSalaryCenter";

interface SalaryPaymentFormProps {
  selectedStaff: SfattWithUser | null;
  form: any;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export function SalaryPaymentForm({
  selectedStaff,
  onSubmit,
  form,
}: SalaryPaymentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Payment Form</CardTitle>
        <CardDescription>
          {selectedStaff
            ? `Record salary payment for ${selectedStaff.fullName}`
            : "Select a staff member to record their salary payment"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
            {/* Staff Info */}
            {selectedStaff && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Staff Name</p>
                    <p className="font-semibold">
                      {`${selectedStaff.fullName}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Staff ID</p>
                    <p className="font-semibold">{selectedStaff.staffId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Base Salary</p>
                    <p className="font-semibold">{selectedStaff.baseSalary}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="text-sm">
                      {selectedStaff?.user?.phone ||
                        selectedStaff?.whatsApp ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm">
                      {selectedStaff?.user?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm">{selectedStaff?.branch || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="grid gap-4 grid-cols-2">
              <FormField
                control={form.control}
                name="baseSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Basic Salary</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            parseFloat(e.target.value) || undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the amount received from staff
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bonus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bonus</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            parseFloat(e.target.value) || undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the amount received from staff
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(Branch).map(([key, value]) => (
                          <SelectItem key={value} value={value}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <PeriodPicker form={form} />
            </div>

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
                        {Object.values(PaymentMethod).map((key) => (
                          <SelectItem value={key}>{key}</SelectItem>
                        ))}
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
              disabled={form.formState.isSubmitting}
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
