"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { formatMony } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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
        admissionFee: data.admissionFee,
        monthlyFee: data.monthlyFee,
        daycareFee: data.daycareFee,
        coachingFee: data.coachingFee,
        residentialFee: data.residentialFee,
        mealFee: data.mealFee,
        isResidential: data.isResidential ?? false,
        isMealIncluded: data.isMealIncluded ?? false,
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
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ?? Number(e.target.value),
                            )
                          }
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
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ?? Number(e.target.value),
                            )
                          }
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
                  name="coachingFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coaching Fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          name={field.name}
                          value={field.value != null ? String(field.value) : ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ?? Number(e.target.value),
                            )
                          }
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
                  name="daycareFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daycare Fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          name={field.name}
                          value={field.value != null ? String(field.value) : ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ?? Number(e.target.value),
                            )
                          }
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
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ?? Number(e.target.value),
                            )
                          }
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
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ?? Number(e.target.value),
                            )
                          }
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            </form>
          </Form>
        </CardContent>
      ) : (
        <CardContent className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Admission Fee</p>
              <p className="font-medium">{formatMony(data?.admissionFee)}</p>
            </div>
            {data && data.monthlyFee && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Monthly Fee</p>
                <p className="font-medium">{formatMony(data.monthlyFee)}</p>
              </div>
            )}
            {data && data.daycareFee && data.daycareFee > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Daycare Fee</p>
                <p className="font-medium">{formatMony(data.daycareFee)}</p>
              </div>
            )}
            {data && data.coachingFee && data.coachingFee > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Coaching Fee</p>
                <p className="font-medium">{formatMony(data.coachingFee)}</p>
              </div>
            )}
            {data && data.mealFee && data.mealFee > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Meal Fee</p>
                <p className="font-medium">{formatMony(data.mealFee)}</p>
              </div>
            )}
            {data && data.residentialFee && data.residentialFee > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Residential Fee</p>
                <p className="font-medium">{formatMony(data.residentialFee)}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Additional Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Residential</p>
              <p className="text-lg font-semibold text-black">
                {data?.isResidential ? "Yes" : "No"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Meal Included</p>
              <p className="text-lg font-semibold text-black">
                {data?.isMealIncluded ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Main Balances Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(data?.feeBalance?.admissionFee?.advance! > 0 ||
              data?.feeBalance?.admissionFee?.due! > 0) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-black">Admission balance</h4>

                <div className="space-y-2">
                  {/* Advance */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border font-semibold ${
                      data?.feeBalance?.admissionFee.advance! > 0
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "bg-gray-50 border-gray-200 text-black"
                    }`}
                  >
                    <span className="text-sm">Advance</span>
                    <span>
                      {formatMony(data?.feeBalance?.admissionFee.advance)}
                    </span>
                  </div>

                  {/* Due */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border font-semibold ${
                      data?.feeBalance?.admissionFee.due! > 0
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-gray-50 border-gray-200 text-black"
                    }`}
                  >
                    <span className="text-sm">Due</span>
                    <span>
                      {formatMony(data?.feeBalance?.admissionFee.due)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {(data?.feeBalance?.monthlyFee.advance! > 0 ||
              data?.feeBalance?.monthlyFee.due! > 0) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-black">Monthly balance</h4>

                <div className="space-y-2">
                  {/* Advance */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border font-semibold ${
                      data?.feeBalance?.monthlyFee.advance! > 0
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "bg-gray-50 border-gray-200 text-black"
                    }`}
                  >
                    <span className="text-sm">Advance</span>
                    <span>
                      {formatMony(data?.feeBalance?.monthlyFee.advance)}
                    </span>
                  </div>

                  {/* Due */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border font-semibold ${
                      data?.feeBalance?.monthlyFee.due! > 0
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-gray-50 border-gray-200 text-black"
                    }`}
                  >
                    <span className="text-sm">Due</span>
                    <span>{formatMony(data?.feeBalance?.monthlyFee.due)}</span>
                  </div>
                </div>
              </div>
            )}

            {(data?.feeBalance?.coachingFee.advance! > 0 ||
              data?.feeBalance?.coachingFee.due! > 0) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-black">Coaching balance</h4>

                <div className="space-y-2">
                  {/* Advance */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border font-semibold ${
                      data?.feeBalance?.coachingFee.advance! > 0
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "bg-gray-50 border-gray-200 text-black"
                    }`}
                  >
                    <span className="text-sm">Advance</span>
                    <span>
                      {formatMony(data?.feeBalance?.coachingFee.advance)}
                    </span>
                  </div>

                  {/* Due */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border font-semibold ${
                      data?.feeBalance?.coachingFee.due! > 0
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-gray-50 border-gray-200 text-black"
                    }`}
                  >
                    <span className="text-sm">Due</span>
                    <span>
                      {formatMony(data?.feeBalance?.coachingFee.advance)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {(data?.feeBalance?.daycareFee.advance! > 0 ||
              data?.feeBalance?.daycareFee.due! > 0) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-black">Daycare balance</h4>

                <div className="space-y-2">
                  {/* Advance */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border font-semibold ${
                      data?.feeBalance?.daycareFee.advance! > 0
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "bg-gray-50 border-gray-200 text-black"
                    }`}
                  >
                    <span className="text-sm">Advance</span>
                    <span>
                      {formatMony(data?.feeBalance?.daycareFee.advance)}
                    </span>
                  </div>

                  {/* Due */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border font-semibold ${
                      data?.feeBalance?.daycareFee.due! > 0
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-gray-50 border-gray-200 text-black"
                    }`}
                  >
                    <span className="text-sm">Due</span>
                    <span>{formatMony(data?.feeBalance?.daycareFee.due)}</span>
                  </div>
                </div>
              </div>
            )}

            {(data?.feeBalance?.residentialFee.advance! > 0 ||
              data?.feeBalance?.residentialFee.due! > 0) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-black">
                  Residential balance
                </h4>

                <div className="space-y-2">
                  {/* Advance */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border font-semibold ${
                      data?.feeBalance?.residentialFee.advance! > 0
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "bg-gray-50 border-gray-200 text-black"
                    }`}
                  >
                    <span className="text-sm">Advance</span>
                    <span>
                      {formatMony(data?.feeBalance?.residentialFee.advance)}
                    </span>
                  </div>

                  {/* Due */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border font-semibold ${
                      data?.feeBalance?.residentialFee.due! > 0
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-gray-50 border-gray-200 text-black"
                    }`}
                  >
                    <span className="text-sm">Due</span>
                    <span>
                      {formatMony(data?.feeBalance?.residentialFee.due)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {(data?.feeBalance?.mealFee.advance! > 0 ||
              data?.feeBalance?.mealFee.due! > 0) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-black">Meal balance</h4>

                <div className="space-y-2">
                  {/* Advance */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border font-semibold ${
                      data?.feeBalance?.mealFee.advance! > 0
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "bg-gray-50 border-gray-200 text-black"
                    }`}
                  >
                    <span className="text-sm">Advance</span>
                    <span>{formatMony(data?.feeBalance?.mealFee.advance)}</span>
                  </div>

                  {/* Due */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border font-semibold ${
                      data?.feeBalance?.mealFee.due! > 0
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-gray-50 border-gray-200 text-black"
                    }`}
                  >
                    <span className="text-sm">Due</span>
                    <span>{formatMony(data?.feeBalance?.mealFee.due)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </EditableSection>
  );
}
