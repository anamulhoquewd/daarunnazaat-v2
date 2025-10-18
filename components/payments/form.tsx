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
import PickDate from "@/components/pick-date";
import { IPayment, IStudent } from "@/interfaces";
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
  students,
  sSearch,
  setSSearch,
}: {
  form: any;
  onSubmit: any;
  isLoading: boolean;
  values?: IPayment | null;
  isEditing?: boolean;
  students: IStudent[];
  sSearch: string;
  setSSearch: (sSearch: string) => void;
}) {
  useEffect(() => {
    if (values) {
      const formattedValues = {
        ...values,
        paid_at: values.paid_at ? new Date(values.paid_at) : new Date(),

        admin_id: values.admin_id._id,
        student_id: values.student_id._id,
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
          name="student_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Search class..."
                      value={sSearch}
                      onChange={(e) => setSSearch(e.target.value)}
                      className="w-full border-b border-gray-300 px-2 py-1 mb-2"
                    />
                  </FormControl>

                  {students.length === 0 ? (
                    <p className="p-2 text-gray-500">No students found.</p>
                  ) : (
                    students.map((student) => (
                      <SelectItem key={student._id} value={student._id}>
                        {student.name}
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

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">Amount</FormLabel>
              <FormControl>
                <Input placeholder="500" {...field} min={0} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Month</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a month" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="january">january</SelectItem>
                  <SelectItem value="february">february</SelectItem>
                  <SelectItem value="march">march</SelectItem>
                  <SelectItem value="april">april</SelectItem>
                  <SelectItem value="may">may</SelectItem>
                  <SelectItem value="june">june</SelectItem>
                  <SelectItem value="july">july</SelectItem>
                  <SelectItem value="august">august</SelectItem>
                  <SelectItem value="september">september</SelectItem>
                  <SelectItem value="october">october</SelectItem>
                  <SelectItem value="november">november</SelectItem>
                  <SelectItem value="december">december</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the class where the student belongs
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">Year</FormLabel>
              <FormControl>
                <Input
                  placeholder="2025"
                  {...field}
                  min={0}
                  minLength={4}
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PickDate label="Paid At" name="paid_at" form={form} />

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
