"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuardianStudents } from "@/hooks/exam/useGuardianExams";
import { useAuthStore } from "@/stores/useAuthStore";
import { ClipboardList, User, Wallet } from "lucide-react";
import Link from "next/link";

export default function MyStudentsPage() {
  const { me } = useAuthStore();
  const guardianId = (me as any)?.guardian?._id;

  const { students, isLoading } = useGuardianStudents(guardianId);

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle>My Students</CardTitle>
        <CardDescription>View exam results and fee history for your children</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <User className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p>No students linked to your account.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <div
                key={student._id}
                className="rounded-xl border bg-card p-5 flex flex-col gap-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {student.fullName?.charAt(0)?.toUpperCase() ?? "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground">{student.studentId}</p>
                    {student.classId?.className && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {student.classId.className}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/my-students/${student._id}/results`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <ClipboardList className="h-3.5 w-3.5" />
                      Results
                    </Button>
                  </Link>
                  <Link href={`/dashboard/my-students/${student._id}/fees`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Wallet className="h-3.5 w-3.5" />
                      Fees
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
