"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

export function Step2ClassesFees() {
  const form = useFormContext();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedIds: string[] = form.watch("applicableClasses") ?? [];
  const classFees: { classId: string; fee: number }[] =
    form.watch("classFees") ?? [];

  useEffect(() => {
    setLoading(true);
    api
      .get("/classes?limit=100")
      .then((r) => setClasses(r.data.data ?? []))
      .catch(handleAxiosError)
      .finally(() => setLoading(false));
  }, []);

  const toggleClass = (classId: string, checked: boolean) => {
    const currentIds: string[] = form.getValues("applicableClasses") ?? [];
    const currentFees: any[] = form.getValues("classFees") ?? [];
    const currentSubjects: any[] = form.getValues("subjectsByClass") ?? [];

    if (checked) {
      form.setValue("applicableClasses", [...currentIds, classId]);
      form.setValue("classFees", [...currentFees, { classId, fee: 0 }]);
      form.setValue("subjectsByClass", [
        ...currentSubjects,
        { classId, subjects: [] },
      ]);
    } else {
      form.setValue(
        "applicableClasses",
        currentIds.filter((id) => id !== classId),
      );
      form.setValue(
        "classFees",
        currentFees.filter((cf) => cf.classId !== classId),
      );
      form.setValue(
        "subjectsByClass",
        currentSubjects.filter((sc) => sc.classId !== classId),
      );
    }
  };

  const setFee = (classId: string, fee: number) => {
    const current: any[] = form.getValues("classFees") ?? [];
    form.setValue(
      "classFees",
      current.map((cf) => (cf.classId === classId ? { ...cf, fee } : cf)),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Classes & Exam Fees</h2>
        <p className="text-sm text-muted-foreground">
          Select the classes participating in this exam and set the exam fee for
          each.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No classes found. Please create classes first.
        </p>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => {
            const isChecked = selectedIds.includes(cls._id);
            const feeEntry = classFees.find((cf) => cf.classId === cls._id);
            return (
              <div
                key={cls._id}
                className={`flex items-center gap-4 p-3 rounded-md border transition-colors ${
                  isChecked
                    ? "border-primary/40 bg-primary/5"
                    : "border-border"
                }`}
              >
                <Checkbox
                  id={cls._id}
                  checked={isChecked}
                  onCheckedChange={(v) => toggleClass(cls._id, !!v)}
                />
                <Label
                  htmlFor={cls._id}
                  className="flex-1 cursor-pointer font-medium"
                >
                  {cls.className}
                </Label>
                {isChecked && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Exam Fee ()
                    </span>
                    <Input
                      type="number"
                      min={0}
                      className="w-28"
                      value={feeEntry?.fee ?? 0}
                      onChange={(e) =>
                        setFee(cls._id, parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {form.formState.errors.applicableClasses && (
        <FormMessage>
          {form.formState.errors.applicableClasses.message as string}
        </FormMessage>
      )}
      {form.formState.errors.classFees && (
        <FormMessage>
          {form.formState.errors.classFees.message as string}
        </FormMessage>
      )}
    </div>
  );
}
