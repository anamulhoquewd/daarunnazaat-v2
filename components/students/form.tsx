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
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import PickDate from "@/components/pick-date";
import { IClass, IStudent } from "@/interfaces";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegistrationForm({
  form,
  onSubmit,
  isLoading,
  values,
  isEditing,
  classes,
  setCSearch,
  cSearch,
}: {
  form: any;
  onSubmit: any;
  isLoading: boolean;
  values?: IStudent | null;
  isEditing?: boolean;
  classes: IClass[];
  cSearch: string;
  setCSearch: (cSearch: string) => void;
}) {
  useEffect(() => {
    if (values) {
      const formattedValues = {
        ...values,
        admission_date: values.admission_date
          ? new Date(values.admission_date)
          : new Date(),
        date_of_birth: values.date_of_birth
          ? new Date(values.date_of_birth)
          : new Date(),

        class_id: values.class_id._id,
      };

      form.reset(formattedValues);
    }
  }, [values, form]);

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
          name="guardian_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">Guardian name</FormLabel>
              <FormControl>
                <Input placeholder="Type guardian name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guardian_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">Guardian phone</FormLabel>
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
                <Textarea placeholder="Type address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monthly_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">Monthly fee</FormLabel>
              <FormControl>
                <Input placeholder="500" {...field} min={0} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <PickDate label="Admission date" name="admission_date" form={form} />
          <PickDate label="Date of birth" name="date_of_birth" form={form} />
        </div>

        <div className="flex items-center gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="cursor-pointer">Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the student&apos;s gender
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="class_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="cursor-pointer">Class</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Search class..."
                        value={cSearch}
                        onChange={(e) => setCSearch(e.target.value)}
                        className="w-full border-b border-gray-300 px-2 py-1 mb-2"
                      />
                    </FormControl>

                    {classes.length === 0 ? (
                      <p className="p-2 text-gray-500">No classes found.</p>
                    ) : (
                      classes.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the class where the student belongs
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">Role</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="id_card"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">ID Card</FormLabel>
              <FormControl>
                <Input placeholder="1234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
