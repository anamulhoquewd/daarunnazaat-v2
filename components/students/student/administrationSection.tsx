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
              {data?.userId?.blockedAt ? "Blocked" : "Unblocked"}
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
