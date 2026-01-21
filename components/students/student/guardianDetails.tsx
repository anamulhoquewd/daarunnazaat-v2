"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IStudent } from "@/validations";

interface GuardianDetailsProps {
  data?: IStudent;
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
            <p className="font-medium">
              {data?.guardianId?._id ? data?.guardianId?._id : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Guardian ID</p>
            <p className="font-medium">
              {data?.guardianId?.guardianId
                ? data?.guardianId?.guardianId
                : "N/A"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">
              {data?.guardianId?.firstName
                ? data?.guardianId?.firstName +
                  " " +
                  (data?.guardianId?.lastName ? data?.guardianId?.lastName : "")
                : "N/A"}
            </p>
          </div>{" "}
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-medium">
              {data?.guardianId?.gender ? data?.guardianId?.gender : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
