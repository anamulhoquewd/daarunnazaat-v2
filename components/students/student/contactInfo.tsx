"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IStaff, IStudent, IUpdateStaff, IUpdateStudent } from "@/validations";
import { ContactInfo, contactInfoSchema } from "@/validations/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { EditableSection } from "./editableSection";

import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ContactInfoSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: IStudent | IStaff;
  onSave?: (data: IUpdateStudent | IUpdateStaff) => Promise<void>;
}

export function ContactInfoSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: ContactInfoSectionProps) {
  const form = useForm<ContactInfo>({
    resolver: zodResolver(contactInfoSchema),
  });

  useEffect(() => {
    if (data) {
      form.reset({
        alternativePhone: data?.alternativePhone,
        whatsApp: data?.whatsApp,
      });
    }
  }, [data, form.reset]);

  const handleSave = async (formData: ContactInfo) => {
    try {
      if (onSave) {
        await onSave(formData);
      }
      onEditChange(false);
    } catch (error) {
      console.error("Error saving contact info:", error);
    }
  };

  console.log("Form values: ", form.getValues());
  console.log("Form errors: ", form.formState.errors);

  return (
    <EditableSection
      title="Contact Information"
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
          <Form {...form}>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alternative Phone */}
                <FormField
                  control={form.control}
                  name="alternativePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternative Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Alternative phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* WhatsApp */}
                <FormField
                  control={form.control}
                  name="whatsApp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="WhatsApp number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      ) : (
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{data?.userId?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{data?.userId?.phone || "N/A"}</p>
            </div>
          </div>
          {(data?.alternativePhone || data?.whatsApp) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Alternative Phone
                </p>
                <p className="font-medium">{data?.alternativePhone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <p className="font-medium">{data?.whatsApp || "N/A"}</p>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </EditableSection>
  );
}
