"use client";

import CopyToClipboard from "@/components/common/copyToClipboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard } from "@/lib/utils";
import { IStudent } from "@/validations";
import { format } from "date-fns";
import { Clipboard, Copy } from "lucide-react";

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium">
              {data?.createdAt ? format(data?.createdAt, "cc LLL yyyy") : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Passout Date</p>
            <p className="font-medium">
              {data?.passoutDate
                ? format(data?.passoutDate, "cc LLL yyyy")
                : "N/A"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Activity</p>
            <p className="font-medium">
              {data?.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Block status</p>
            <p className="font-medium capitalize">
              {data?.blockedAt ? "Blocked" : "Not Blocked"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Blocked At</p>
            <p className="font-medium">
              {data?.blockedAt ? format(data?.blockedAt, "cc LLL yyyy") : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Deleted At</p>
            <p className="font-medium">
              {data?.deletedAt ? format(data?.deletedAt, "cc LLL yyyy") : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
