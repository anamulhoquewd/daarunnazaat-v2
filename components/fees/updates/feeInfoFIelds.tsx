"use client";

import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { DateField } from "@/components/common/dateCalendar";
import { PaymentMethod } from "@/validations";
import { PeriodPicker } from "@/components/common/datePeriod";

interface Changes {
  receivedAmount?: { old: number; new: number };
  period?: { old: string; new: string };
}

interface FeeFormFieldsProps {
  form: UseFormReturn<any>;
  changes: Changes;
  remarksError: string | null;
  onReceivedAmountChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
}

export function FeeFormFields({
  form,
  changes,
  remarksError,
  onReceivedAmountChange,
  onPeriodChange,
}: FeeFormFieldsProps) {
  const hasChanges = Object.keys(changes).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-slate-900">
          Update Fee Details
        </CardTitle>
        <CardDescription>Modify the following fields as needed</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Received Amount */}
        <FormField
          control={form.control}
          name="receivedAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Received Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value != null ? String(field.value) : ""}
                  onChange={(e) => onReceivedAmountChange(e.target.value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              </FormControl>
              {changes.receivedAmount && (
                <FormDescription className="text-xs text-blue-600">
                  Changed from BDT {changes.receivedAmount.old.toLocaleString()}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Date */}
        <DateField name="paymentDate" label="Date of Payment" />

        {/* Payment Method */}
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
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Billing Period Section */}

        <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-100">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
            <strong>⚠ Billing Period Correction</strong>
            <p className="mt-1">
              Use only if the billing period was entered incorrectly.
            </p>
          </AlertDescription>
        </Alert>

        <div className="p-4 bg-amber-50 dark:bg-amber-900 rounded-lg border border-amber-200 dark:border-amber-700">
          <PeriodPicker form={form} onPeriodChange={onPeriodChange} />

          {changes.period && (
            <p className="text-xs text-amber-700 mt-2.5 ml-1">
              Changed from {changes.period.old}
            </p>
          )}
        </div>

        {/* Remarks */}
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Notes / Remarks{" "}
                {hasChanges && (
                  <span className="text-xs font-semibold text-red-600">
                    Required
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes (optional)"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              {remarksError && (
                <FormDescription className="text-xs text-red-600 mt-1">
                  {remarksError}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
