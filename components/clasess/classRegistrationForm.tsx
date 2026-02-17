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
import { IClass } from "@/validations";
import { useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { DialogClose } from "../ui/dialog";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

export default function ClassRegistrationForm({
  form,
  handleSubmit,
  isLoading,
  values,
}: {
  isLoading: boolean;
  handleSubmit: (data: IClass) => Promise<void>;
  form: any;
  values: IClass | null;
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
            name="className"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Takmil" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe this class..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Fee *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter monthly fee"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter capacity"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
