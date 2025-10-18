"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { IClass } from "@/interfaces";
import PickDate from "@/components/pick-date";

export default function RegistrationForm({
  form,
  onSubmit,
  isLoading,
  values,
  isEditing,
}: {
  form: any;
  onSubmit: any;
  isLoading: boolean;
  values?: IClass | null;
  isEditing?: boolean;
}) {
  // Reset form with default values of the user. it's for editing purpose.
  useEffect(() => {
    if (values) {
      const formattedValues = {
        ...values,
        opening_date: values.opening_date
          ? new Date(values.opening_date)
          : new Date(), // default fallback
      };
      form.reset(formattedValues);
    }
  }, [values, form]);

  // Reset form with default values of the customer. it's for editing purpose.
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full px-1"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">Class Name</FormLabel>
              <FormControl>
                <Input placeholder="Daarul Hadees" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teacher"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">Teacher</FormLabel>
              <FormControl>
                <Input placeholder="Teacher in Charge" {...field} />
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
              <FormLabel className="cursor-pointer">Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Decribe about your class" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PickDate label="Opening Date" name="opening_date" form={form} />

        <DialogFooter>
          <Button type="submit" className="cursor-pointer" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : isEditing ? (
              "Update"
            ) : (
              "Register"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
