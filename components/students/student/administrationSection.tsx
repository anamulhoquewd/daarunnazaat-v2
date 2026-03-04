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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">User ref</p>
            <code className="bg-muted rounded text-xs font-mono truncate">
              {data?.userId?._id?.substring(0, 10)}...
            </code>
            <CopyToClipboard
              title={"Copy User ID"}
              text={data?.userId?._id || "N/A"}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Profile ref</p>
            <code className="bg-muted rounded text-xs font-mono truncate">
              {data?.userId?._id?.substring(0, 10)}...
            </code>
            <CopyToClipboard
              title={"Copy Profile ID"}
              text={data?.userId?.profile || "N/N"}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium">
              {data?.userId.createdAt
                ? format(data?.userId.createdAt, "cc LLL yyyy")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Login</p>
            <p className="font-medium">
              {data?.userId?.lastLogin
                ? format(data?.userId?.lastLogin, "cc LLL yyyy")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Passout Date</p>
            <p className="font-medium">
              {data?.userId?.passoutDate
                ? format(data?.userId?.passoutDate, "cc LLL yyyy")
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
              {data?.userId?.blockedAt ? "Blocked" : "Unblocked"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Blocked At</p>
            <p className="font-medium">
              {data?.userId?.blockedAt
                ? format(data?.userId?.blockedAt, "cc LLL yyyy")
                : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
