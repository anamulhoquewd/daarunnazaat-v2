"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IStudent } from "@/validations";
import { format } from "date-fns";

interface AdministrationSectionProps {
  data?: IStudent;
}

export function AdministrationSection({ data }: AdministrationSectionProps) {
  const statusBadge = data?.isDeleted ? (
    <Badge variant="destructive" className="text-xs">Deleted</Badge>
  ) : data?.isBlocked ? (
    <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">Blocked</Badge>
  ) : data?.isActive ? (
    <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20">Active</Badge>
  ) : (
    <Badge variant="secondary" className="text-xs">Inactive</Badge>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Administration</CardTitle>
          {statusBadge}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm font-medium">
              {data?.createdAt ? format(data.createdAt, "dd LLL yyyy") : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Passout Date</p>
            <p className="text-sm font-medium">
              {data?.passoutDate ? format(data.passoutDate, "dd LLL yyyy") : "—"}
            </p>
          </div>
        </div>
        {(data?.blockedAt || data?.deletedAt) && (
          <div className="grid grid-cols-2 gap-4">
            {data.blockedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Blocked At</p>
                <p className="text-sm font-medium">{format(data.blockedAt, "dd LLL yyyy")}</p>
              </div>
            )}
            {data.deletedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Deleted At</p>
                <p className="text-sm font-medium">{format(data.deletedAt, "dd LLL yyyy")}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
