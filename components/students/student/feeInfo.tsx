"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Fees, feesSchema } from "@/validations/student";
import { EditableSection } from "./editableSection";

interface FeesSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: Fees;
  onSave?: (data: Fees) => Promise<void>;
}

export function FeesSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: FeesSectionProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Fees>({
    resolver: zodResolver(feesSchema),
    defaultValues: data || {
      admissionFee: 0,
      admissionDiscount: 0,
      monthlyFee: 0,
      residentialFee: 0,
      mealFee: 0,
      isResidential: false,
      isMealIncluded: false,
    },
  });

  const handleSave = async (formData: Fees) => {
    try {
      if (onSave) {
        await onSave(formData);
      }
      onEditChange(false);
    } catch (error) {
      console.error("Error saving fees:", error);
    }
  };

  return (
    <EditableSection
      title="Fees Information"
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
              <Label htmlFor="admissionFee">Admission Fee</Label>
              <Input
                id="admissionFee"
                type="number"
                placeholder="0"
                {...register("admissionFee", {
                  valueAsNumber: true,
                })}
              />
              {errors.admissionFee && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.admissionFee.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="admissionDiscount">Admission Discount</Label>
              <Input
                id="admissionDiscount"
                type="number"
                placeholder="0"
                {...register("admissionDiscount", {
                  valueAsNumber: true,
                })}
              />
              {errors.admissionDiscount && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.admissionDiscount.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="monthlyFee">Monthly Fee</Label>
            <Input
              id="monthlyFee"
              type="number"
              placeholder="0"
              {...register("monthlyFee", {
                valueAsNumber: true,
              })}
            />
            {errors.monthlyFee && (
              <p className="text-sm text-red-500 mt-1">
                {errors.monthlyFee.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="residentialFee">Residential Fee</Label>
              <Input
                id="residentialFee"
                type="number"
                placeholder="0"
                {...register("residentialFee", {
                  valueAsNumber: true,
                })}
              />
              {errors.residentialFee && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.residentialFee.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="mealFee">Meal Fee</Label>
              <Input
                id="mealFee"
                type="number"
                placeholder="0"
                {...register("mealFee", {
                  valueAsNumber: true,
                })}
              />
              {errors.mealFee && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.mealFee.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Controller
                name="isResidential"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isResidential"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isResidential" className="cursor-pointer">
                Is Residential
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Controller
                name="isMealIncluded"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isMealIncluded"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isMealIncluded" className="cursor-pointer">
                Meal Included
              </Label>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Admission Fee</p>
              <p className="font-medium">৳ {data?.admissionFee || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Admission Discount
              </p>
              <p className="font-medium">৳ {data?.admissionDiscount || 0}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Fee</p>
            <p className="font-medium">৳ {data?.monthlyFee || 0}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Residential Fee</p>
              <p className="font-medium">৳ {data?.residentialFee || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meal Fee</p>
              <p className="font-medium">৳ {data?.mealFee || 0}</p>
            </div>
          </div>
          <div className="flex gap-6 pt-2">
            <div>
              <p className="text-sm text-muted-foreground">Residential</p>
              <p className="font-medium">
                {data?.isResidential ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meal Included</p>
              <p className="font-medium">
                {data?.isMealIncluded ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
      )}
    </EditableSection>
  );
}
