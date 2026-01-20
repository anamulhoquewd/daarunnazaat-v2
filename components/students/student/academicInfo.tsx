"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AcademicInfo, academicInfoSchema } from "@/validations/student";
import { EditableSection } from "./editableSection";

interface AcademicInfoSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: AcademicInfo;
  onSave?: (data: AcademicInfo) => Promise<void>;
}

export function AcademicInfoSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: AcademicInfoSectionProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AcademicInfo>({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: data || {
      studentId: "",
      classId: "",
      branch: "",
      batchType: "",
      currentSessionId: "",
      admissionDate: new Date(),
    },
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

  return (
    <EditableSection
      title="Academic Information"
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
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                placeholder="Student ID"
                disabled
                {...register("studentId")}
              />
            </div>
            <div>
              <Label htmlFor="classId">Class ID</Label>
              <Input
                id="classId"
                placeholder="Class ID"
                {...register("classId")}
              />
              {errors.classId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.classId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" placeholder="Branch" {...register("branch")} />
              {errors.branch && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.branch.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="batchType">Batch Type</Label>
              <Input
                id="batchType"
                placeholder="Batch type"
                {...register("batchType")}
              />
              {errors.batchType && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.batchType.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentSessionId">Current Session ID</Label>
              <Input
                id="currentSessionId"
                placeholder="Session ID"
                {...register("currentSessionId")}
              />
              {errors.currentSessionId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.currentSessionId.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="admissionDate">Admission Date</Label>
              <Input
                id="admissionDate"
                type="date"
                {...register("admissionDate", {
                  valueAsDate: true,
                })}
              />
              {errors.admissionDate && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.admissionDate.message}
                </p>
              )}
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Student ID</p>
              <p className="font-medium">{data?.studentId || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Class</p>
              <p className="font-medium">{data?.classId || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Branch</p>
              <p className="font-medium">{data?.branch || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Batch Type</p>
              <p className="font-medium">{data?.batchType || "N/A"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Session</p>
              <p className="font-medium">{data?.currentSessionId || "N/A"}</p>
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
