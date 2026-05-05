"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface GuardianDetailsProps {
  data?: any;
}

export function GuardianDetails({ data }: GuardianDetailsProps) {
  const guardian = data?.guardian;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Guardian</CardTitle>
          {guardian?._id && (
            <Link
              href={`/dashboard/guardians/${guardian._id}`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              View profile
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!guardian ? (
          <p className="text-sm text-muted-foreground">No guardian linked.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{guardian.fullName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Guardian ID</p>
                <p className="text-sm font-medium font-mono">{guardian.guardianId || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Relationship</p>
                <p className="text-sm font-medium capitalize">{data?.guardianRelation || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm font-medium capitalize">{guardian.gender || "—"}</p>
              </div>
            </div>
            {(guardian.user?.phone || guardian.userId?.phone) && (
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium font-mono">
                  {guardian.user?.phone || guardian.userId?.phone}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
