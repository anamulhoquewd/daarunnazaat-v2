"use client";

import { CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IStudent, IUpdateStudent } from "@/validations";
import { Fees, feesSchema } from "@/validations/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { EditableSection } from "./editableSection";

interface FeesSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: IStudent;
  onSave?: (data: IUpdateStudent) => Promise<void>;
}

export function FeesSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: FeesSectionProps) {
  const form = useForm({
    resolver: zodResolver(feesSchema),
  });

  useEffect(() => {
    if (data) {
      form.reset({
        admissionFee: data.admissionFee ?? 0,
        admissionDiscount: data.admissionDiscount ?? 0,
        monthlyFee: data.monthlyFee ?? 0,
        residentialFee: data.residentialFee ?? 0,
        mealFee: data.mealFee ?? 0,
        isResidential: data.isResidential ?? false,
        isMealIncluded: data.isMealIncluded ?? false,
        admissionDate: data.admissionDate
          ? new Date(data.admissionDate)
          : new Date(),
      });
    }
  }, [data, form]);

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
                  name="monthlyFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          name={field.name}
                          value={field.value != null ? String(field.value) : ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="residentialFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residential Fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          name={field.name}
                          value={field.value != null ? String(field.value) : ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mealFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          name={field.name}
                          value={field.value != null ? String(field.value) : ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="admissionFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          name={field.name}
                          value={field.value != null ? String(field.value) : ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admissionDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Discount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          name={field.name}
                          value={field.value != null ? String(field.value) : ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="isResidential"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Is Residential Student
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isMealIncluded"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Meal Included
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      ) : (
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Fee</p>
              <p className="font-medium">{data?.monthlyFee?.toFixed(2) || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Residential Fee</p>
              <p className="font-medium">
                {data?.residentialFee?.toFixed(2) || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meal Fee</p>
              <p className="font-medium">{data?.mealFee?.toFixed(2) || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Admission Fee</p>
              <p className="font-medium">
                {data?.admissionFee?.toFixed(2) || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Admission Discount
              </p>
              <p className="font-medium">
                {data?.admissionDiscount?.toFixed(2) || 0}
              </p>
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
        </CardContent>
      )}
    </EditableSection>
  );
}
