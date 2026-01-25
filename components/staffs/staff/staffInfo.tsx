"use client";

import { DateField } from "@/components/common/dateCalendar";
import { EditableSection } from "@/components/students/student/editableSection";
import { CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
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
import { Branch, IStaff, IUpdateStaff } from "@/validations";
import { StaffInfo, staffInfoSchema } from "@/validations/staff";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface StaffInfoSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: IStaff;
  onSave?: (data: IUpdateStaff) => Promise<void>;
}

export function StaffInfoSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: StaffInfoSectionProps) {
  const form = useForm({
    resolver: zodResolver(staffInfoSchema),
  });

  const handleSave = async (formData: StaffInfo) => {
    try {
      if (onSave) {
        await onSave(formData);
      }
      onEditChange(false);
    } catch (error) {
      console.error("Error saving academic info:", error);
    }
  };

  useEffect(() => {
    if (data) {
      form.reset({
        branch: data?.branch ?? "",
        joinDate: new Date(),
        designation: data?.designation ?? "",
        department: data?.department ?? "",
        basicSalary: data?.basicSalary ?? 0,
      });
    }
  }, [data, form.reset]);

  return (
    <EditableSection
      title="Staff Information"
      isEditing={isEditing}
      onEdit={() => onEditChange(true)}
      onCancel={() => {
        form.reset();
        onEditChange(false);
      }}
      isSaving={form.formState.isSubmitting}
      onSave={form.handleSubmit(handleSave)}
    >
      {isEditing ? (
        <CardContent>
          <FormProvider {...form}>
            <Form {...form}>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation *</FormLabel>
                        <FormControl>
                          <Input placeholder="Shaikhul hadees" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Department" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DateField name="joinDate" label="Join Date" />

                  <FormField
                    control={form.control}
                    name="basicSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="Basic Salary"
                            {...field}
                            value={field.value ? String(field.value) : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      ) : (
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Staff ID</p>
              <p className="font-medium">{data?.staffId || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Designation</p>
              <p className="font-medium">{data?.designation || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Branch</p>
              <p className="font-medium">{data?.branch || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{data?.department || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Join Date</p>
              <p className="font-medium">
                {data?.joinDate &&
                  new Date(data?.joinDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salary</p>
              <p className="font-medium">{data?.basicSalary || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      )}
    </EditableSection>
  );
}
