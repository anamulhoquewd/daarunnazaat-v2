"use client";

import CopyToClipboard from "@/components/common/copyToClipboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GuardianDetailsProps {
  data?: any;
}

export function GuardianDetails({ data }: GuardianDetailsProps) {
  return (
    <Card className="p-6 border border-border">
      <CardHeader>
        <CardTitle>Guardian Details</CardTitle>
        <CardDescription>Not etidable</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Guardian ref</p>
            <code className="bg-muted rounded text-xs font-mono truncate">
              {data?.guardianId?.substring(0, 10)}...
            </code>
            <CopyToClipboard
              title={"Copy Guardian ID"}
              text={data?.guardianId || "N/N"}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Guardian ID</p>
            <p className="font-medium">
              {data?.guardian?.guardianId ? data?.guardian?.guardianId : "N/A"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">
              {data?.guardian?.fullName ? data?.guardian?.fullName : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-medium">
              {data?.guardian?.gender ? data?.guardian?.gender : "N/A"}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Relationship</p>
          <p className="font-medium">
            {data?.guardianRelation ? data?.guardianRelation : "N/A"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
