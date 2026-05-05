"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMony } from "@/lib/utils";

interface ClassDetailsProps {
  data?: any;
}

export function ClassDetails({ data }: ClassDetailsProps) {
  const cls = data?.class;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Class Details</CardTitle>
          {cls && (
            <Badge
              variant={cls.isActive ? "outline" : "secondary"}
              className={
                cls.isActive
                  ? "text-xs text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20"
                  : "text-xs"
              }
            >
              {cls.isActive ? "Active" : "Inactive"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!cls ? (
          <p className="text-sm text-muted-foreground">No class assigned.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Class Name</p>
                <p className="text-sm font-medium">{cls.className || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="text-sm font-medium">{cls.capacity ?? "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Fee</p>
                <p className="text-sm font-medium tabular-nums">
                  {cls.monthlyFee != null
                    ? `${formatMony(cls.monthlyFee)}`
                    : "—"}
                </p>
              </div>
              {cls.description && (
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm font-medium">{cls.description}</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
