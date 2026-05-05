"use client";

import { EditableSection } from "@/components/students/student/editableSection";
import { CardContent } from "@/components/ui/card";
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
import { createGuardianZ } from "@/modules/zod/guardian";
import { BloodGroup, Gender, IGuardian, IUpdateGuardian } from "@/validations";
import { PersonalInfo } from "@/validations/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export const guardianUpdateParsonalInfo = createGuardianZ.pick({
  fullName: true,
  gender: true,
  bloodGroup: true,
  avatar: true,
  nid: true,
  occupation: true,
  monthlyIncome: true,
});

interface PersonalInfoSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: IGuardian;
  onSave?: (data: IUpdateGuardian) => Promise<void>;
}

export function PersonalInfoSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: PersonalInfoSectionProps) {
  const form = useForm({
    resolver: zodResolver(guardianUpdateParsonalInfo),
  });

  useEffect(() => {
    if (data) {
      form.reset({
        fullName: data.fullName ?? "",
        gender: data.gender ?? "",
        bloodGroup: data.bloodGroup ?? BloodGroup.NON,
        nid: data.nid ?? "",
        occupation: data.occupation ?? "",
        monthlyIncome: data.monthlyIncome ?? undefined,
      });
    }
  }, [data, form.reset]);

  const handleSave = async (formData: PersonalInfo) => {
    try {
      if (onSave) {
        await onSave(formData);
      }
      onEditChange(false);
    } catch (error) {
      console.error("Error saving personal info:", error);
    }
  };

  return (
    <EditableSection
      title="Personal Information"
      isEditing={isEditing}
      onEdit={() => onEditChange(true)}
      onCancel={() => {
        form.reset();
        onEditChange(false);
      }}
      onSave={form.handleSubmit(handleSave)}
      isSaving={form.formState.isSubmitting}
    >
      {isEditing ? (
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="nid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="10 or 17 digits" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Must be 10 or 17 digits
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
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
                          {Object.entries(Gender).map(([_, value]) => (
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

                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(BloodGroup).map(([_, value]) => (
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start">
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Teacher" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => {
                    const { value, ...rest } = field;
                    return (
                      <FormItem>
                        <FormLabel>Monthly Income (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1,00,000"
                            {...rest}
                            value={
                              typeof value === "number"
                                ? String(value)
                                : typeof value === "string"
                                  ? value
                                  : ""
                            }
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      ) : (
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="font-medium">{data?.fullName || "N/A"}</p>
            </div>

            {data?.nid && (
              <div>
                <p className="text-sm text-muted-foreground">NID</p>
                <p className="font-medium">{data?.nid || "N/A"}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Blood Group</p>
              <p className="font-medium">{data?.bloodGroup || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{data?.gender || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Occupation</p>
              <p className="font-medium">{data?.occupation || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Monthly Income (Avarage)
              </p>
              <p className="font-medium capitalize">
                {data?.monthlyIncome || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </EditableSection>
  );
}
