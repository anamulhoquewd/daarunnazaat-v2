"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditableSection } from "./editableSection";
import { PersonalInfo, personalInfoSchema } from "@/validations/student";

interface PersonalInfoSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: PersonalInfo;
  onSave?: (data: PersonalInfo) => Promise<void>;
}

export function PersonalInfoSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: PersonalInfoSectionProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data || {
      firstName: "",
      lastName: "",
      gender: "male",
      dateOfBirth: new Date(),
    },
  });

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
        reset();
        onEditChange(false);
      }}
      onSave={handleSubmit(handleSave)}
    >
      {isEditing ? (
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="First name"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Last name"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth", {
                  valueAsDate: true,
                })}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fatherName">Father Name (Optional)</Label>
              <Input
                id="fatherName"
                placeholder="Father name"
                {...register("fatherName")}
              />
            </div>
            <div>
              <Label htmlFor="motherName">Mother Name (Optional)</Label>
              <Input
                id="motherName"
                placeholder="Mother name"
                {...register("motherName")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bloodGroup">Blood Group (Optional)</Label>
              <Select
                defaultValue={data?.bloodGroup || ""}
                onValueChange={(value) => {
                  // Handle blood group change
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nid">NID (Optional)</Label>
              <Input id="nid" placeholder="NID number" {...register("nid")} />
            </div>
          </div>

          <div>
            <Label htmlFor="birthCertificateNumber">
              Birth Certificate Number (Optional)
            </Label>
            <Input
              id="birthCertificateNumber"
              placeholder="Birth certificate number"
              {...register("birthCertificateNumber")}
            />
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="font-medium">{data?.firstName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="font-medium">{data?.lastName || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">
                {data?.dateOfBirth
                  ? new Date(data.dateOfBirth).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{data?.gender || "N/A"}</p>
            </div>
          </div>
          {(data?.fatherName || data?.motherName) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Father Name</p>
                <p className="font-medium">{data?.fatherName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mother Name</p>
                <p className="font-medium">{data?.motherName || "N/A"}</p>
              </div>
            </div>
          )}
          {(data?.bloodGroup || data?.nid) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="font-medium">{data?.bloodGroup || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NID</p>
                <p className="font-medium">{data?.nid || "N/A"}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </EditableSection>
  );
}
