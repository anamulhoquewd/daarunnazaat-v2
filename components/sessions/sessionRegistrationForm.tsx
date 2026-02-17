"use client";

import { Button } from "@/components/ui/button";
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
import { BatchType, ISession } from "@/validations";
import { useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { DateField } from "../common/dateCalendar";
import { DialogClose } from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

export default function SessionRegistrationForm({
  form,
  handleSubmit,
  isLoading,
  values,
}: {
  isLoading: boolean;
  handleSubmit: (data: ISession) => Promise<void>;
  form: any;
  values: ISession | null;
}) {
  useEffect(() => {
    if (values) {
      form.reset(values, {
        keepDirty: false,
        keepTouched: false,
      });
    }
  }, [values]);

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="sessionName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Type session name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="batchType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(BatchType).map(([_, value]) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateField name="startDate" label="Start Date" />
            <DateField name="endDate" label="End Date" />
          </div>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Active Status</FormLabel>
                  <FormDescription>
                    Enable or disable this class
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-6 gap-2.5">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() =>
                form.reset({
                  className: "",
                  description: "",
                  monthlyFee: 0,
                  capacity: 0,
                  isActive: true,
                })
              }
            >
              <DialogClose>Cancel</DialogClose>
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
  );
}
