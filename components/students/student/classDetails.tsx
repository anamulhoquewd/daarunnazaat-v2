"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ClassDetailsProps {
  data?: any;
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
              {data?.class?.className ? data?.class?.className : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium">
              {data?.class?.description ? data?.class?.description : "N/A"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Activity</p>
            <p className="font-medium">
              {data?.class?.isActive ? "Active" : "Deactive"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Capacity</p>
            <p className="font-medium">
              {data?.class?.capacity ? data?.class?.capacity : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly fee</p>
            <p className="font-medium">
              {data?.class?.monthlyFee ? data?.class?.monthlyFee : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
