"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IStudent } from "@/validations";
import { ArrowLeft, Expand, MoreVertical } from "lucide-react";
import Link from "next/link";

export function StudentProfileHeader({ data }: { data: IStudent }) {
  return (
    <div className="border-b border-border bg-card">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/students"
              className="bg-accent p-2 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage alt={data?.firstName} src={data?.avatar || ""} />
              <AvatarFallback className="text-lg font-semibold">
                {data
                  ? `${data.firstName.charAt(0)}${data?.lastName?.charAt(0)}`
                  : "NA"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">
                  {data?.firstName} {data?.lastName}
                </h1>
                {data?.userId?.isActive ? (
                  <Badge variant="secondary" className="text-sm">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-sm">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {data?.studentId} • {data?.classId?.className} •{" "}
                {data?.batchType}
              </p>
              <p className="text-sm text-muted-foreground">
                Date of Birth:{" "}
                {data?.dateOfBirth &&
                  new Date(data?.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Expand className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
