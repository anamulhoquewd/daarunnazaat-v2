"use client";

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
import { IUser, UserRole } from "@/validations";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

export default function UserRegistrationForm({
  form,
  handleSubmit,
  isLoading,
  clearForm,
  values,
}: {
  isLoading: boolean;
  clearForm: () => void;
  handleSubmit: (data: IUser) => Promise<void>;
  form: ReturnType<typeof useForm>;
  values: IUser | null;
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input placeholder="fnfo@darunnazat.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input placeholder="019********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => {
              console.log("Role Field:", field);
              return (
                <FormItem>
                  <FormLabel>Role *</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {Object.entries(UserRole).map(([_, value]) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormDescription>Do not select super admin</FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

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
  );
}
