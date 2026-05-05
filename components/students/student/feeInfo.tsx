"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { IStudent, IUpdateStudent } from "@/validations";
import { Fees, feesSchema } from "@/validations/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatMony } from "@/lib/utils";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { EditableSection } from "./editableSection";
import { cn } from "@/lib/utils";

interface FeesSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: IStudent;
  onSave?: (data: IUpdateStudent) => Promise<void>;
}

interface BalancePair {
  label: string;
  advance: number;
  due: number;
}

function BalanceCard({ label, advance, due }: BalancePair) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="space-y-1.5">
        <div
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-md border text-sm font-medium",
            advance > 0
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
              : "bg-muted/50 border-border text-muted-foreground",
          )}
        >
          <span>Advance</span>
          <span className="tabular-nums">{formatMony(advance)}</span>
        </div>
        <div
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-md border text-sm font-medium",
            due > 0
              ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
              : "bg-muted/50 border-border text-muted-foreground",
          )}
        >
          <span>Due</span>
          <span className="tabular-nums">{formatMony(due)}</span>
        </div>
      </div>
    </div>
  );
}

function FeeItem({ label, value }: { label: string; value?: number }) {
  if (!value && value !== 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{formatMony(value)}</p>
    </div>
  );
}

function FeeInputField({
  control,
  name,
  label,
}: {
  control: any;
  name: string;
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="0"
              name={field.name}
              value={field.value != null ? String(field.value) : ""}
              onChange={(e) =>
                field.onChange(e.target.value ? Number(e.target.value) : "")
              }
              onBlur={field.onBlur}
              ref={field.ref}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function FeesSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: FeesSectionProps) {
  const form = useForm({ resolver: zodResolver(feesSchema) });

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
      await onSave?.(formData);
      onEditChange(false);
    } catch (error) {
      console.error("Error saving fees:", error);
    }
  };

  const fb = (data as any)?.feeBalance;

  const balances: BalancePair[] = [
    {
      label: "Admission",
      advance: fb?.admissionFee?.advance ?? 0,
      due: fb?.admissionFee?.due ?? 0,
    },
    {
      label: "Monthly",
      advance: fb?.monthlyFee?.advance ?? 0,
      due: fb?.monthlyFee?.due ?? 0,
    },
    {
      label: "Coaching",
      advance: fb?.coachingFee?.advance ?? 0,
      due: fb?.coachingFee?.due ?? 0,
    },
    {
      label: "Daycare",
      advance: fb?.daycareFee?.advance ?? 0,
      due: fb?.daycareFee?.due ?? 0,
    },
    {
      label: "Residential",
      advance: fb?.residentialFee?.advance ?? 0,
      due: fb?.residentialFee?.due ?? 0,
    },
    {
      label: "Meal",
      advance: fb?.mealFee?.advance ?? 0,
      due: fb?.mealFee?.due ?? 0,
    },
  ].filter((b) => b.advance > 0 || b.due > 0);

  return (
    <EditableSection
      title="Fees & Balances"
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
        <CardContent className="pt-2">
          <Form {...form}>
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FeeInputField
                  control={form.control}
                  name="admissionFee"
                  label="Admission Fee"
                />
                <FeeInputField
                  control={form.control}
                  name="monthlyFee"
                  label="Monthly Fee"
                />
                <FeeInputField
                  control={form.control}
                  name="coachingFee"
                  label="Coaching Fee"
                />
                <FeeInputField
                  control={form.control}
                  name="daycareFee"
                  label="Daycare Fee"
                />
                <FeeInputField
                  control={form.control}
                  name="residentialFee"
                  label="Residential Fee"
                />
                <FeeInputField
                  control={form.control}
                  name="mealFee"
                  label="Meal Fee"
                />
              </div>
              <div className="flex gap-6 pt-1">
                <FormField
                  control={form.control}
                  name="isResidential"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Residential student
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isMealIncluded"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Meal included
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      ) : (
        <CardContent className="space-y-6 pt-2">
          {/* Fee rates */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-muted/40 rounded-lg">
            <FeeItem label="Admission" value={data?.admissionFee} />
            <FeeItem label="Monthly" value={data?.monthlyFee} />
            {(data?.coachingFee ?? 0) > 0 && (
              <FeeItem label="Coaching" value={data?.coachingFee} />
            )}
            {(data?.daycareFee ?? 0) > 0 && (
              <FeeItem label="Daycare" value={data?.daycareFee} />
            )}
            {(data?.residentialFee ?? 0) > 0 && (
              <FeeItem label="Residential" value={data?.residentialFee} />
            )}
            {(data?.mealFee ?? 0) > 0 && (
              <FeeItem label="Meal" value={data?.mealFee} />
            )}
          </div>

          {/* Flags */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Residential:{" "}
              <span
                className={cn(
                  "font-medium",
                  data?.isResidential ? "text-emerald-600" : "text-foreground",
                )}
              >
                {data?.isResidential ? "Yes" : "No"}
              </span>
            </span>
            <span>
              Meal:{" "}
              <span
                className={cn(
                  "font-medium",
                  data?.isMealIncluded ? "text-emerald-600" : "text-foreground",
                )}
              >
                {data?.isMealIncluded ? "Included" : "Not included"}
              </span>
            </span>
          </div>

          {/* Balances */}
          {balances.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Outstanding Balances
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {balances.map((b) => (
                    <BalanceCard key={b.label} {...b} />
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </EditableSection>
  );
}
