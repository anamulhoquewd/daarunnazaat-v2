"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IStudent } from "@/validations";

interface ClassDetailsProps {
  data?: IStudent;
}

export function ClassDetails({ data }: ClassDetailsProps) {
  return (
    <Card className="p-6 border border-border">
      <CardHeader>
        <CardTitle>Class Details</CardTitle>
        <CardDescription>Not etidable</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Class Name</p>
            <p className="font-medium">
              {data?.classId?.className ? data?.classId?.className : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium">
              {data?.classId?.description ? data?.classId?.description : "N/A"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Activity</p>
            <p className="font-medium">
              {data?.classId?.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly fee</p>
            <p className="font-medium">
              {data?.classId?.monthlyFee ? data?.classId?.monthlyFee : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
