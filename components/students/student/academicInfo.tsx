"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BatchType, Branch, IStudent } from "@/validations";
import { AcademicInfo, academicInfoSchema } from "@/validations/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EditableSection } from "./editableSection";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";
import { ClassCombobox } from "@/components/students/new/classCombobox";
import { SessionCombobox } from "../new/sessionCombobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateField } from "@/components/common/dateCalendar";

interface AcademicInfoSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: IStudent;
  onSave?: (data: IStudent) => Promise<void>;
}

export function AcademicInfoSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: AcademicInfoSectionProps) {
  const form = useForm({
    resolver: zodResolver(academicInfoSchema),
  });

  const handleSave = async (formData: AcademicInfo) => {
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
        studentId: data?.studentId || "",
        branch: data?.branch || "",
        batchType: data?.batchType || "",
        classId: data?.classId._id || "",
        currentSessionId: data?.currentSessionId._id || "",
        admissionDate: new Date(),
      });
    }
  }, [data, form.reset]);

  console.log("form values:", form.getValues(), "data:", data);

  return (
    <EditableSection
      title="Academic Information"
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
        <Form {...form}>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Student ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <ClassCombobox
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              <FormField
                control={form.control}
                name="batchType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select batch type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(BatchType).map(([key, value]) => (
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
                name="currentSessionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session</FormLabel>
                    <FormControl>
                      <SessionCombobox
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DateField name="admissionDate" label="Admission Date" />
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Student ID</p>
              <p className="font-medium">{data?.studentId || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Class Name</p>
              <p className="font-medium">{data?.classId.className || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Branch</p>
              <p className="font-medium">{data?.branch || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Batch Type</p>
              <p className="font-medium">{data?.batchType || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Session</p>
              <p className="font-medium">
                {data?.currentSessionId.sessionName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admission Date</p>
              <p className="font-medium">
                {data?.admissionDate
                  ? new Date(data.admissionDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </EditableSection>
  );
}
