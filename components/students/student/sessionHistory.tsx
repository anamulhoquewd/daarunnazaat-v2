"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentProfile } from "@/hooks/students/useStudentActions";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface SessionHistorySectionProps {
  data?: StudentProfile;
}

export function SessionHistorySection({ data }: SessionHistorySectionProps) {
  const sessions: any[] = data?.sessionHistory ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Session History</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No session history found.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((entry: any, idx: number) => {
              const s = entry?.sessionId;
              if (!s) return null;
              return (
                <div
                  key={s._id ?? idx}
                  className="flex items-start justify-between gap-4 rounded-lg border px-4 py-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-medium text-sm truncate">{s.sessionName ?? "—"}</p>
                    {s.batchType && (
                      <p className="text-xs text-muted-foreground">{s.batchType}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      {s.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(s.startDate), "dd LLL yyyy")}
                        </span>
                      )}
                      {s.endDate && (
                        <span>→ {format(new Date(s.endDate), "dd LLL yyyy")}</span>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={s.isActive ? "outline" : "secondary"}
                    className={s.isActive ? "text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20 shrink-0 text-xs" : "shrink-0 text-xs"}
                  >
                    {s.isActive ? "Active" : "Ended"}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
