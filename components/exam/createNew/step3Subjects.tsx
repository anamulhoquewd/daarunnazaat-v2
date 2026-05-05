"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

export function Step3Subjects() {
  const form = useFormContext();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  const applicableClasses: string[] = form.watch("applicableClasses") ?? [];
  const subjectsByClass: any[] = form.watch("subjectsByClass") ?? [];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/exams/subjects"),
      api.get("/classes?limit=100"),
    ])
      .then(([subRes, clsRes]) => {
        setSubjects(subRes.data.data ?? []);
        setClasses(clsRes.data.data ?? []);
      })
      .catch(handleAxiosError)
      .finally(() => setLoading(false));
  }, []);

  const getClassName = (classId: string) =>
    classes.find((c) => c._id === classId)?.className ?? classId;

  const getClassEntry = (classId: string) =>
    subjectsByClass.find((sc) => sc.classId === classId) ?? {
      classId,
      subjects: [],
    };

  const toggleSubject = (
    classId: string,
    subjectId: string,
    checked: boolean,
  ) => {
    const current: any[] = form.getValues("subjectsByClass") ?? [];
    const updated = current.map((entry) => {
      if (entry.classId !== classId) return entry;
      const subs: any[] = entry.subjects ?? [];
      if (checked) {
        return {
          ...entry,
          subjects: [...subs, { subjectId, fullMarks: 100, passMarks: 40 }],
        };
      }
      return {
        ...entry,
        subjects: subs.filter((s) => s.subjectId !== subjectId),
      };
    });
    form.setValue("subjectsByClass", updated);
  };

  const updateMarks = (
    classId: string,
    subjectId: string,
    field: "fullMarks" | "passMarks",
    value: number,
  ) => {
    const current: any[] = form.getValues("subjectsByClass") ?? [];
    const updated = current.map((entry) => {
      if (entry.classId !== classId) return entry;
      return {
        ...entry,
        subjects: entry.subjects.map((s: any) =>
          s.subjectId === subjectId ? { ...s, [field]: value } : s,
        ),
      };
    });
    form.setValue("subjectsByClass", updated);
  };

  if (loading)
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-md" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Subjects per Class</h2>
        <p className="text-sm text-muted-foreground">
          For each class, select subjects and set full marks and pass marks.
        </p>
      </div>

      {subjects.length === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
          No subjects found. Please add subjects first via{" "}
          <strong>Settings → Subjects</strong>.
        </p>
      )}

      {applicableClasses.map((classId) => {
        const entry = getClassEntry(classId);
        const selectedSubjectIds = (entry.subjects ?? []).map(
          (s: any) => s.subjectId,
        );

        return (
          <div key={classId} className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
              <span className="font-medium">{getClassName(classId)}</span>
              <Badge variant="outline">
                {selectedSubjectIds.length} subject
                {selectedSubjectIds.length !== 1 ? "s" : ""} selected
              </Badge>
            </div>

            <div className="p-4 space-y-3">
              {subjects.map((subject) => {
                const isSelected = selectedSubjectIds.includes(subject._id);
                const subEntry = (entry.subjects ?? []).find(
                  (s: any) => s.subjectId === subject._id,
                );
                return (
                  <div key={subject._id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`${classId}-${subject._id}`}
                        checked={isSelected}
                        onCheckedChange={(v) =>
                          toggleSubject(classId, subject._id, !!v)
                        }
                      />
                      <Label
                        htmlFor={`${classId}-${subject._id}`}
                        className="cursor-pointer font-medium"
                      >
                        {subject.name}
                        {subject.code && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({subject.code})
                          </span>
                        )}
                      </Label>
                    </div>

                    {isSelected && subEntry && (
                      <div className="ml-7 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground whitespace-nowrap">
                            Full Marks
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            className="w-20 h-8 text-sm"
                            value={subEntry.fullMarks}
                            onChange={(e) =>
                              updateMarks(
                                classId,
                                subject._id,
                                "fullMarks",
                                parseInt(e.target.value) || 0,
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground whitespace-nowrap">
                            Pass Marks
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            className="w-20 h-8 text-sm"
                            value={subEntry.passMarks}
                            onChange={(e) =>
                              updateMarks(
                                classId,
                                subject._id,
                                "passMarks",
                                parseInt(e.target.value) || 0,
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
