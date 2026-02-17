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
import { BloodGroup, Gender, IGuardian, IUpdateGuardian } from "@/validations";
import { guardianPpersonalInfoSchema } from "@/validations/guardian";
import { PersonalInfo } from "@/validations/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

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
    resolver: zodResolver(guardianPpersonalInfoSchema),
  });

  useEffect(() => {
    if (data) {
      form.reset({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        gender: data.gender ?? "",
        bloodGroup: data.bloodGroup ?? BloodGroup.NON,
        nid: data.nid ?? "",
        birthCertificateNumber: data.birthCertificateNumber ?? "",
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
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="birthCertificateNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Certificate (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="17 digits" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Must be 17 digits
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
              <p className="font-medium">{data?.firstName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="font-medium">{data?.lastName || "N/A"}</p>
            </div>
          </div>

          {(data?.birthCertificateNumber || data?.nid) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">NID</p>
                <p className="font-medium">{data?.nid || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Birth Certificate
                </p>
                <p className="font-medium">
                  {data?.birthCertificateNumber || "N/A"}
                </p>
              </div>
            </div>
          )}
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
              <p className="text-sm text-muted-foreground">Monthly Income</p>
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
