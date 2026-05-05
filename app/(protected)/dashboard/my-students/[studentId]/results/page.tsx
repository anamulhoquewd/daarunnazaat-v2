"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStudentExamResults } from "@/hooks/exam/useGuardianExams";
import { BefaqGrade } from "@/validations";
import { ChevronLeft, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const gradeColors: Record<string, string> = {
  [BefaqGrade.MUMTAZ]: "bg-emerald-100 text-emerald-800",
  [BefaqGrade.JAYYID_JIDDAN]: "bg-blue-100 text-blue-800",
  [BefaqGrade.JAYYID]: "bg-sky-100 text-sky-800",
  [BefaqGrade.MAQBUL]: "bg-yellow-100 text-yellow-800",
  [BefaqGrade.RASIB]: "bg-red-100 text-red-800",
};

export default function StudentResultsPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const { results, isLoading } = useStudentExamResults(studentId);

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/my-students"
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <CardTitle>Exam Results</CardTitle>
            <CardDescription>Published exam results for this student</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p>No published results found for this student.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {results.map((result) => (
              <div key={result._id} className="rounded-xl border overflow-hidden">
                {/* Exam header */}
                <div className="bg-muted/40 px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
                  <div>
                    <p className="font-semibold">{result.examId?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.examId?.type} · {result.examId?.academicYear}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Position</p>
                      <p className="font-bold text-lg">{result.position ?? "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Percentage</p>
                      <p className="font-bold text-lg">{result.percentage?.toFixed(1)}%</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        gradeColors[result.grade] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {result.grade}
                    </span>
                    <Badge variant={result.isPassed ? "default" : "destructive"}>
                      {result.isPassed ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                </div>

                {/* Subject marks */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">Full Marks</TableHead>
                      <TableHead className="text-center">Pass Marks</TableHead>
                      <TableHead className="text-center">Obtained</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(result.subjectMarks ?? []).map((sm: any) => (
                      <TableRow key={sm._id ?? sm.subjectId?._id}>
                        <TableCell className="font-medium">
                          {sm.subjectId?.name ?? "—"}
                          {sm.subjectId?.code && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({sm.subjectId.code})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{sm.fullMarks}</TableCell>
                        <TableCell className="text-center">{sm.passMarks}</TableCell>
                        <TableCell className="text-center font-semibold">
                          {sm.isAbsent ? (
                            <Badge variant="outline" className="text-xs">Absent</Badge>
                          ) : (
                            sm.marksObtained
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {sm.isAbsent ? (
                            <Badge variant="secondary">Absent</Badge>
                          ) : sm.marksObtained >= sm.passMarks ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pass</Badge>
                          ) : (
                            <Badge variant="destructive">Fail</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Totals row */}
                <div className="bg-muted/20 px-4 py-2 flex justify-end gap-6 text-sm border-t">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">
                    {result.totalMarks} / {result.totalFullMarks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
