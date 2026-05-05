"use client";

import { MarksEntryGrid } from "@/components/exam/MarksEntryGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/axios/intercepter";
import useExamDetail from "@/hooks/exam/useExamDetail";
import { handleAxiosError } from "@/lib/utils";
import { ExamStatus, PaymentMethod } from "@/validations";
import { format } from "date-fns";
import {
  BookOpen,
  Calendar,
  DollarSign,
  Send,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const statusStyle: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  ongoing: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  results_published: "bg-purple-100 text-purple-700",
};

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    exam,
    isLoading,
    enrollments,
    enrollmentsLoading,
    feesSummary,
    results,
    resultsLoading,
    selectedClassId,
    setSelectedClassId,
    fetchEnrollments,
    fetchFeesSummary,
    fetchResults,
    publishResults,
    recalculatePositions,
  } = useExamDetail(id);

  const [paymentEnrollmentId, setPaymentEnrollmentId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<string>(PaymentMethod.CASH);
  const [payNote, setPayNote] = useState("");
  const [paying, setPaying] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === "enrollments") fetchEnrollments();
    if (tab === "fees") { fetchEnrollments(); fetchFeesSummary(); }
    if (tab === "results") fetchResults(selectedClassId || undefined);
  };

  const applicableClasses: any[] = exam?.applicableClasses ?? [];

  // Build subjects list for the selected class (for marks entry)
  const classSubjectConfig = (exam?.subjectsByClass ?? []).find(
    (sc: any) => sc.classId?._id === selectedClassId || sc.classId === selectedClassId,
  );
  const subjectsForGrid = (classSubjectConfig?.subjects ?? []).map((s: any) => ({
    subjectId: s.subjectId?._id ?? s.subjectId,
    name: s.subjectId?.name ?? "Subject",
    fullMarks: s.fullMarks,
    passMarks: s.passMarks,
  }));

  const enrollmentsForGrid = enrollments
    .filter(
      (e: any) =>
        !selectedClassId ||
        (e.classId?._id ?? e.classId) === selectedClassId,
    )
    .map((e: any) => ({
      studentId: e.studentId?._id ?? e.studentId,
      fullName: e.studentId?.fullName ?? "Student",
      studentIdCode: e.studentId?.studentId ?? "",
    }));

  const submitPayment = async () => {
    if (!paymentEnrollmentId) return;
    setPaying(true);
    try {
      await api.post(
        `/exams/${id}/enrollments/${paymentEnrollmentId}/payments`,
        {
          amount: parseFloat(payAmount),
          method: payMethod,
          note: payNote,
        },
      );
      toast.success("Payment recorded");
      setPaymentEnrollmentId(null);
      setPayAmount("");
      setPayNote("");
      fetchEnrollments();
    } catch (e) {
      handleAxiosError(e);
    } finally {
      setPaying(false);
    }
  };

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );

  if (!exam)
    return (
      <div className="text-center py-16 text-muted-foreground">
        Exam not found.
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{exam.name}</h1>
                <Badge
                  variant="outline"
                  className={`capitalize ${statusStyle[exam.status] ?? ""}`}
                >
                  {exam.status?.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="capitalize">{exam.type}</span>
                <span>•</span>
                <span>{exam.academicYear}</span>
                <span>•</span>
                <span>
                  {exam.startDate
                    ? format(new Date(exam.startDate), "dd MMM yyyy")
                    : "-"}{" "}
                  –{" "}
                  {exam.endDate
                    ? format(new Date(exam.endDate), "dd MMM yyyy")
                    : "-"}
                </span>
              </div>
            </div>

            {exam.status !== ExamStatus.RESULTS_PUBLISHED && (
              <Button onClick={publishResults} className="gap-2 shrink-0">
                <Send className="w-4 h-4" /> Publish Results
              </Button>
            )}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <StatCard icon={<Users className="w-4 h-4" />} label="Enrolled" value={exam.enrollmentCount ?? 0} />
            <StatCard icon={<BookOpen className="w-4 h-4" />} label="Classes" value={applicableClasses.length} />
            <StatCard
              icon={<DollarSign className="w-4 h-4" />}
              label="Collected"
              value={`${(exam.totalCollectedFee ?? 0).toLocaleString()}`}
            />
            <StatCard
              icon={<DollarSign className="w-4 h-4" />}
              label="Expected"
              value={`${(exam.totalExpectedFee ?? 0).toLocaleString()}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5 lg:w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Applicable Classes</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {applicableClasses.map((cls: any) => (
                  <Badge key={cls._id ?? cls} variant="secondary">
                    {cls.className ?? cls}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Subjects by Class</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(exam.subjectsByClass ?? []).map((entry: any) => (
                <div key={entry.classId?._id ?? entry.classId}>
                  <p className="font-medium text-sm mb-2">
                    {entry.classId?.className ?? entry.classId}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(entry.subjects ?? []).map((s: any) => (
                      <Badge key={s.subjectId?._id ?? s.subjectId} variant="outline">
                        {s.subjectId?.name ?? "Subject"} — {s.fullMarks}/{s.passMarks}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollments */}
        <TabsContent value="enrollments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Enrolled Students ({enrollments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrollmentsLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Fee Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((enr: any) => (
                        <TableRow key={enr._id}>
                          <TableCell>
                            <div className="font-medium">
                              {enr.studentId?.fullName ?? "-"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {enr.studentId?.studentId ?? ""}
                            </div>
                          </TableCell>
                          <TableCell>
                            {enr.classId?.className ?? "-"}
                          </TableCell>
                          <TableCell>{enr.feeAmount}</TableCell>
                          <TableCell>{enr.feePaid}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                enr.feeStatus === "paid"
                                  ? "text-green-700 border-green-200 bg-green-50"
                                  : enr.feeStatus === "partial"
                                    ? "text-yellow-700 border-yellow-200 bg-yellow-50"
                                    : "text-red-700 border-red-200 bg-red-50"
                              }
                            >
                              {enr.feeStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!enrollments.length && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-muted-foreground py-8"
                          >
                            No enrollments yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees */}
        <TabsContent value="fees" className="space-y-4 mt-4">
          {feesSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard icon={<Users className="w-4 h-4" />} label="Total Enrolled" value={feesSummary.overall.totalEnrollments} />
              <StatCard icon={<DollarSign className="w-4 h-4" />} label="Total Expected" value={`${feesSummary.overall.totalExpected?.toLocaleString()}`} />
              <StatCard icon={<DollarSign className="w-4 h-4" />} label="Total Collected" value={`${feesSummary.overall.totalCollected?.toLocaleString()}`} />
            </div>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Fee Collection</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enr: any) => (
                      <TableRow key={enr._id}>
                        <TableCell className="font-medium">
                          {enr.studentId?.fullName ?? "-"}
                        </TableCell>
                        <TableCell>{enr.classId?.className ?? "-"}</TableCell>
                        <TableCell>{enr.feeAmount}</TableCell>
                        <TableCell>{enr.feePaid}</TableCell>
                        <TableCell className="text-destructive font-medium">
                          {enr.feeAmount - enr.feePaid}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              enr.feeStatus === "paid"
                                ? "text-green-700 border-green-200 bg-green-50"
                                : enr.feeStatus === "partial"
                                  ? "text-yellow-700 border-yellow-200 bg-yellow-50"
                                  : "text-red-700 border-red-200 bg-red-50"
                            }
                          >
                            {enr.feeStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {enr.feeStatus !== "paid" && (
                            <Dialog
                              open={paymentEnrollmentId === enr._id}
                              onOpenChange={(open) =>
                                setPaymentEnrollmentId(open ? enr._id : null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Add Payment
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Record Payment</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-2">
                                  <div>
                                    <Label>Amount ()</Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={enr.feeAmount - enr.feePaid}
                                      value={payAmount}
                                      onChange={(e) => setPayAmount(e.target.value)}
                                      placeholder={`Max: ${enr.feeAmount - enr.feePaid}`}
                                    />
                                  </div>
                                  <div>
                                    <Label>Payment Method</Label>
                                    <Select value={payMethod} onValueChange={setPayMethod}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.values(PaymentMethod).map((m) => (
                                          <SelectItem key={m} value={m}>
                                            {m.replace(/_/g, " ")}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Note (optional)</Label>
                                    <Input
                                      value={payNote}
                                      onChange={(e) => setPayNote(e.target.value)}
                                    />
                                  </div>
                                  <Button
                                    className="w-full"
                                    disabled={!payAmount || paying}
                                    onClick={submitPayment}
                                  >
                                    {paying ? "Recording..." : "Record Payment"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results */}
        <TabsContent value="results" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={selectedClassId || "all"}
              onValueChange={(v) => {
                const cid = v === "all" ? "" : v;
                setSelectedClassId(cid);
                fetchResults(cid || undefined);
                if (cid) fetchEnrollments(cid);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {applicableClasses.map((cls: any) => (
                  <SelectItem key={cls._id ?? cls} value={cls._id ?? cls}>
                    {cls.className ?? cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClassId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => recalculatePositions(selectedClassId)}
              >
                Recalculate Positions
              </Button>
            )}
          </div>

          {selectedClassId && subjectsForGrid.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Marks Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <MarksEntryGrid
                  examId={id}
                  classId={selectedClassId}
                  subjects={subjectsForGrid}
                  enrollments={enrollmentsForGrid as any}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Results</CardTitle></CardHeader>
            <CardContent>
              {resultsLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pos.</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>%</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((r: any) => (
                        <TableRow key={r._id}>
                          <TableCell className="font-bold text-lg">
                            {r.position ?? "-"}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {r.studentId?.fullName ?? "-"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {r.studentId?.studentId ?? ""}
                            </div>
                          </TableCell>
                          <TableCell>
                            {r.totalMarks ?? "-"}/{r.totalFullMarks ?? "-"}
                          </TableCell>
                          <TableCell>
                            {r.percentage != null
                              ? `${r.percentage}%`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{r.grade ?? "-"}</Badge>
                          </TableCell>
                          <TableCell>
                            {r.isPublished ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="outline">Draft</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!results.length && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-muted-foreground py-8"
                          >
                            No results yet. Enter marks above to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Exam Schedule</CardTitle></CardHeader>
            <CardContent>
              {(exam.schedule ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">
                  No schedule configured for this exam.
                </p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Room</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(exam.schedule ?? []).map((s: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>
                            {s.classId?.className ?? s.classId}
                          </TableCell>
                          <TableCell>
                            {s.subjectId?.name ?? s.subjectId}
                          </TableCell>
                          <TableCell>
                            {s.date
                              ? format(new Date(s.date), "dd MMM yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {s.startTime} – {s.endTime}
                          </TableCell>
                          <TableCell>{s.room || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
