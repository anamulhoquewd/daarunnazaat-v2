"use client";

import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useBulkPromote } from "@/modules/promotion/hooks";

async function fetchClasses() {
  const { data } = await axios.get("/api/v1/classes");
  return data?.data ?? data ?? [];
}

async function fetchSessions() {
  const { data } = await axios.get("/api/v1/sessions?limit=50&isActive=all");
  return data?.data ?? [];
}

async function fetchStudents(classId: string, sessionId: string) {
  if (!classId || !sessionId) return [];
  const { data } = await axios.get(
    `/api/v1/students?classId=${classId}&sessionId=${sessionId}&limit=200&isActive=true`,
  );
  return data?.data ?? [];
}

const ACTION_OPTIONS = [
  { value: "promoted", label: "Promoted (pass)" },
  { value: "repeated", label: "Repeated (repeat year)" },
  { value: "graduated", label: "Graduated (pass out)" },
  { value: "dropped", label: "Dropped out" },
];

export default function PromotionsPage() {
  // Source
  const [fromClassId, setFromClassId] = useState("");
  const [fromSessionId, setFromSessionId] = useState("");

  // Target
  const [toClassId, setToClassId] = useState("");
  const [toSessionId, setToSessionId] = useState("");

  const [action, setAction] = useState<"promoted" | "repeated" | "graduated" | "dropped">("promoted");
  const [generateInvoice, setGenerateInvoice] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<any[] | null>(null);

  const bulkPromote = useBulkPromote();

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ["classes-list"],
    queryFn: fetchClasses,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions-list"],
    queryFn: fetchSessions,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students-for-promotion", fromClassId, fromSessionId],
    queryFn: () => fetchStudents(fromClassId, fromSessionId),
    enabled: Boolean(fromClassId && fromSessionId),
  });

  function toggleAll() {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s: any) => s._id)));
    }
  }

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handlePromote() {
    if (selectedIds.size === 0) {
      toast.error("Select at least one student");
      return;
    }
    if (!toClassId || !toSessionId) {
      toast.error("Select a target class and session");
      return;
    }

    bulkPromote.mutate(
      {
        fromSessionId,
        fromClassId,
        toClassId,
        toSessionId,
        studentIds: Array.from(selectedIds),
        action,
        generateAdmissionInvoice: generateInvoice,
      },
      {
        onSuccess: (res) => {
          const data = res.data;
          setResults(data.results ?? []);
          toast.success(`Promoted ${data.promoted}/${data.total} students`);
          if (data.failed > 0) {
            toast.warning(`${data.failed} student(s) failed — see results below`);
          }
          setSelectedIds(new Set());
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message ?? "Bulk promotion failed");
        },
      },
    );
  }

  const isReady = Boolean(fromClassId && fromSessionId && toClassId && toSessionId);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Promotion</h1>
        <p className="text-muted-foreground text-sm">
          Move students from one class/session to another in bulk
        </p>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-base">Source (From)</CardTitle>
            <CardDescription>Pick the class and session students are currently in</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="space-y-1">
              <Label>Class</Label>
              <Select value={fromClassId} onValueChange={(v) => { setFromClassId(v); setSelectedIds(new Set()); }}>
                <SelectTrigger>
                  <SelectValue placeholder={classesLoading ? "Loading…" : "Select class"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Session</Label>
              <Select value={fromSessionId} onValueChange={(v) => { setFromSessionId(v); setSelectedIds(new Set()); }}>
                <SelectTrigger>
                  <SelectValue placeholder={sessionsLoading ? "Loading…" : "Select session"} />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s: any) => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Target */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-base">Target (To)</CardTitle>
            <CardDescription>Where students will be moved after promotion</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="space-y-1">
              <Label>Class</Label>
              <Select value={toClassId} onValueChange={setToClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Session</Label>
              <Select value={toSessionId} onValueChange={setToSessionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s: any) => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Options */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="space-y-1">
              <Label>Action</Label>
              <Select value={action} onValueChange={(v) => setAction(v as any)}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <Switch
                id="gen-invoice"
                checked={generateInvoice}
                onCheckedChange={setGenerateInvoice}
              />
              <Label htmlFor="gen-invoice" className="cursor-pointer">
                Generate admission invoice in new session
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student list */}
      {fromClassId && fromSessionId && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Students ({students.length} found)
                </CardTitle>
                <CardDescription>
                  {selectedIds.size} selected
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAll}
                  disabled={students.length === 0}
                >
                  {selectedIds.size === students.length && students.length > 0
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <Button
                  onClick={handlePromote}
                  disabled={!isReady || selectedIds.size === 0 || bulkPromote.isPending}
                >
                  {bulkPromote.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Promote {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {studentsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : students.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No active students found in this class and session.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedIds.size === students.length && students.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s: any) => (
                    <TableRow
                      key={s._id}
                      className="cursor-pointer"
                      onClick={() => toggle(s._id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(s._id)}
                          onCheckedChange={() => toggle(s._id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{s.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{s.studentId}</TableCell>
                      <TableCell>{s.branch}</TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? "default" : "secondary"}>
                          {s.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-base">Promotion Results</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {results.map((r) => (
              <Alert
                key={r.studentId}
                variant={r.status === "ok" ? "default" : "destructive"}
                className="py-2"
              >
                <div className="flex items-center gap-2">
                  {r.status === "ok" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription className="text-sm">
                    <span className="font-medium">{r.studentId}</span>
                    {r.status === "error" && `: ${r.message}`}
                  </AlertDescription>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
