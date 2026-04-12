"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StudentProfile } from "@/hooks/students/useStudentActions";
import { IStudent } from "@/validations";
import { format } from "date-fns";

interface SessionHistorySectionProps {
  data?: StudentProfile;
}

export function SessionHistorySection({ data }: SessionHistorySectionProps) {
  return (
    <Card className="p-6 border border-border">
      <CardHeader>
        <CardTitle>Session histroy</CardTitle>
        <CardDescription>Not etidable</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data?.sessionHistory?.map((session) => (
          <Card>
            <CardHeader>
              <CardTitle>
                Session Name: {session?.sessionId?.sessionName}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Batch Type</p>
                  <p className="font-medium">
                    {session?.sessionId?.batchType
                      ? session?.sessionId?.batchType
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activity</p>
                  <p className="font-medium">
                    {session?.sessionId?.isActive ? "Active" : "Deactive"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {session?.sessionId?.startDate
                      ? format(session?.sessionId?.startDate, "dd LLL yyyy")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {session?.sessionId?.endDate
                      ? format(session?.sessionId?.endDate, "dd LLL yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
