"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "../ui/textarea";
import { IAdmin } from "@/interfaces";
import PickDate from "../pick-date";

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
  values?: IAdmin | null;
  isEditing?: boolean;
}) {
  // Reset form with default values of the user. it's for editing purpose.
  useEffect(() => {
    if (values) {
      const formattedValues = {
        ...values,
        join_date: values.join_date ? new Date(values.join_date) : new Date(), // default fallback
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
              <FormLabel className="cursor-pointer">Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Anamul Hoque" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">Email</FormLabel>
              <FormControl>
                <Input placeholder="anam@gmail.com" {...field} />
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
              <FormLabel className="cursor-pointer">Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="01987654321" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="House: 1, Road: 1, Block: A, Dhaka."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">Designation</FormLabel>
              <FormControl>
                <Input placeholder="Muhaddis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PickDate label="Join Date" name="join_date" form={form} />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="cursor-pointer">Account Status</FormLabel>
                <FormDescription>
                  Account will be active and ready for use immediately after
                  registration
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  className="cursor-pointer"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isEditing && (
          <FormField
            control={form.control}
            name="is_blocked"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="cursor-pointer">
                    Account Block Status
                  </FormLabel>
                  <FormDescription>
                    Turn ON to <span className="font-medium">block</span> this
                    account. Blocked users cannot log in or access the system.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    className="cursor-pointer"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

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
