"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

export function Step4Schedule() {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedule",
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const applicableClasses: string[] = form.watch("applicableClasses") ?? [];

  useEffect(() => {
    Promise.all([
      api.get("/classes?limit=100"),
      api.get("/exams/subjects"),
    ])
      .then(([clsRes, subRes]) => {
        setClasses(clsRes.data.data ?? []);
        setSubjects(subRes.data.data ?? []);
      })
      .catch(handleAxiosError);
  }, []);

  const applicableClassObjects = classes.filter((c) =>
    applicableClasses.includes(c._id),
  );

  const addRow = () =>
    append({
      classId: applicableClasses[0] ?? "",
      subjectId: "",
      date: new Date(),
      startTime: "08:00",
      endTime: "10:00",
      room: "",
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Exam Schedule</h2>
        <p className="text-sm text-muted-foreground">
          Optional. Add date and time slots for each class–subject combination.
        </p>
      </div>

      {fields.length === 0 ? (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground text-sm">
          No schedule entries yet. Add one below or skip this step.
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end border rounded-md p-3"
            >
              <div className="col-span-2 md:col-span-1">
                <Label className="text-xs text-muted-foreground">Class</Label>
                <Select
                  value={form.watch(`schedule.${idx}.classId`)}
                  onValueChange={(v) =>
                    form.setValue(`schedule.${idx}.classId`, v)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicableClassObjects.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <Select
                  value={form.watch(`schedule.${idx}.subjectId`)}
                  onValueChange={(v) =>
                    form.setValue(`schedule.${idx}.subjectId`, v)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  className="h-9"
                  value={
                    form.watch(`schedule.${idx}.date`)
                      ? new Date(form.watch(`schedule.${idx}.date`))
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    form.setValue(
                      `schedule.${idx}.date`,
                      new Date(e.target.value) as any,
                    )
                  }
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Start</Label>
                <Input
                  type="time"
                  className="h-9"
                  {...form.register(`schedule.${idx}.startTime`)}
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">End</Label>
                <Input
                  type="time"
                  className="h-9"
                  {...form.register(`schedule.${idx}.endTime`)}
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Room</Label>
                  <Input
                    className="h-9"
                    placeholder="optional"
                    {...form.register(`schedule.${idx}.room`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-9 w-9"
                  onClick={() => remove(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" onClick={addRow}>
        <Plus className="w-4 h-4 mr-2" /> Add Schedule Entry
      </Button>
    </div>
  );
}
