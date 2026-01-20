"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContactInfo, contactInfoSchema } from "@/validations/student";
import { EditableSection } from "./editableSection";

interface ContactInfoSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: ContactInfo;
  onSave?: (data: ContactInfo) => Promise<void>;
}

export function ContactInfoSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: ContactInfoSectionProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactInfo>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: data || {
      email: "",
      phone: "",
      alternativePhone: "",
      whatsApp: "",
    },
  });

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

  return (
    <EditableSection
      title="Contact Information"
      isEditing={isEditing}
      onEdit={() => onEditChange(true)}
      onCancel={() => {
        reset();
        onEditChange(false);
      }}
      onSave={handleSubmit(handleSave)}
    >
      {isEditing ? (
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Phone number"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alternativePhone">
                Alternative Phone (Optional)
              </Label>
              <Input
                id="alternativePhone"
                placeholder="Alternative phone"
                {...register("alternativePhone")}
              />
            </div>
            <div>
              <Label htmlFor="whatsApp">WhatsApp (Optional)</Label>
              <Input
                id="whatsApp"
                placeholder="WhatsApp number"
                {...register("whatsApp")}
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{data?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{data?.phone || "N/A"}</p>
            </div>
          </div>
          {(data?.alternativePhone || data?.whatsApp) && (
            <div className="grid grid-cols-2 gap-4">
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
        </div>
      )}
    </EditableSection>
  );
}
