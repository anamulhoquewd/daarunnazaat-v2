"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IStudent } from "@/validations";

interface AdministrationSectionProps {
  data?: IStudent;
}

export function AdministrationSection({ data }: AdministrationSectionProps) {
  return (
    <Card className="p-6 border border-border">
      <CardHeader>
        <CardTitle>Administration</CardTitle>
        <CardDescription>Not etidable</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">User ID</p>
            <p className="font-medium">{data?.userId?._id || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Profile ID</p>
            <p className="font-medium">{data?.userId?.profile || "N/A"}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium">
              {data?.userId.createdAt
                ? new Date(data?.userId.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Login</p>
            <p className="font-medium">
              {data?.userId?.lastLogin
                ? new Date(data?.userId?.lastLogin).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Passout Date</p>
            <p className="font-medium">
              {data?.userId?.passoutDate
                ? new Date(data?.userId?.passoutDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Activity</p>
            <p className="font-medium">
              {data?.userId?.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Block status</p>
            <p className="font-medium capitalize">
              {data?.userId?.blockedAt ? "Blocked" : "Not Blocked"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Blocked At</p>
            <p className="font-medium">
              {data?.userId?.blockedAt
                ? new Date(data?.userId?.blockedAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
