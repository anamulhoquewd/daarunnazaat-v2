"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  examId: string;
  classId: string;
  subjects: { subjectId: string; name: string; fullMarks: number; passMarks: number }[];
  enrollments: { studentId: string; fullName: string }[];
}

interface CellState {
  marksObtained: number;
  isAbsent: boolean;
}

type GridState = Record<string, Record<string, CellState>>;

export function MarksEntryGrid({ examId, classId, subjects, enrollments }: Props) {
  const [grid, setGrid] = useState<GridState>({});
  const [saving, setSaving] = useState(false);

  // Initialize grid with zeros
  useEffect(() => {
    const initial: GridState = {};
    for (const enr of enrollments) {
      initial[enr.studentId] = {};
      for (const sub of subjects) {
        initial[enr.studentId][sub.subjectId] = {
          marksObtained: 0,
          isAbsent: false,
        };
      }
    }
    setGrid(initial);
  }, [enrollments, subjects]);

  const setCell = (
    studentId: string,
    subjectId: string,
    field: keyof CellState,
    value: any,
  ) => {
    setGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          ...prev[studentId]?.[subjectId],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const results = enrollments.map((enr) => ({
        studentId: enr.studentId,
        subjectMarks: subjects.map((sub) => ({
          subjectId: sub.subjectId,
          marksObtained: grid[enr.studentId]?.[sub.subjectId]?.marksObtained ?? 0,
          isAbsent: grid[enr.studentId]?.[sub.subjectId]?.isAbsent ?? false,
        })),
      }));

      await api.post(`/exams/${examId}/results/bulk`, {
        classId,
        results,
      });

      toast.success("Marks saved successfully");
    } catch (e) {
      handleAxiosError(e);
    } finally {
      setSaving(false);
    }
  };

  if (!enrollments.length)
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No students enrolled in this class.
      </p>
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Marks"}
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px] sticky left-0 bg-background z-10">
                Student
              </TableHead>
              {subjects.map((sub) => (
                <TableHead
                  key={sub.subjectId}
                  className="text-center min-w-[130px]"
                >
                  <div>{sub.name}</div>
                  <div className="text-xs font-normal text-muted-foreground">
                    Full: {sub.fullMarks} | Pass: {sub.passMarks}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enr) => (
              <TableRow key={enr.studentId}>
                <TableCell className="sticky left-0 bg-background z-10 font-medium">
                  <div>{enr.fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    {enr.studentId}
                  </div>
                </TableCell>
                {subjects.map((sub) => {
                  const cell = grid[enr.studentId]?.[sub.subjectId];
                  const isAbsent = cell?.isAbsent ?? false;
                  return (
                    <TableCell key={sub.subjectId} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          max={sub.fullMarks}
                          disabled={isAbsent}
                          className="w-20 text-center h-8 text-sm"
                          value={isAbsent ? "" : (cell?.marksObtained ?? 0)}
                          onChange={(e) =>
                            setCell(
                              enr.studentId,
                              sub.subjectId,
                              "marksObtained",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                        <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                          <Checkbox
                            checked={isAbsent}
                            onCheckedChange={(v) =>
                              setCell(enr.studentId, sub.subjectId, "isAbsent", !!v)
                            }
                          />
                          Absent
                        </label>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
