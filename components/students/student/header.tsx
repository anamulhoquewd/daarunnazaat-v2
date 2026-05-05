"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudentProfile } from "@/hooks/students/useStudentActions";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  GraduationCap,
  Lock,
  Loader2,
  MapPin,
  MoreVertical,
  RotateCcw,
  ShieldOff,
  Trash2,
  UserCheck,
  UserMinus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConfirmType =
  | "deactivate"
  | "block"
  | "soft-delete"
  | "permanent-delete"
  | null;

interface ConfirmConfig {
  title: string;
  description: string;
  actionLabel: string;
  destructive?: boolean;
  requireTyping?: boolean;
}

const CONFIRM_CONFIGS: Record<NonNullable<ConfirmType>, ConfirmConfig> = {
  deactivate: {
    title: "Deactivate Student?",
    description: "The student will no longer appear as active. You can reactivate them at any time.",
    actionLabel: "Deactivate",
  },
  block: {
    title: "Block Student?",
    description: "The student's account will be blocked. You can unblock them at any time.",
    actionLabel: "Block",
    destructive: true,
  },
  "soft-delete": {
    title: "Soft-Delete Student?",
    description: "The student record will be marked as deleted but can be restored later.",
    actionLabel: "Delete",
    destructive: true,
  },
  "permanent-delete": {
    title: "Permanently Delete Student?",
    description: "This action cannot be undone. All student data will be removed from the system.",
    actionLabel: "Permanently Delete",
    destructive: true,
    requireTyping: true,
  },
};

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadges({ data }: { data: StudentProfile }) {
  if (data.isDeleted)
    return <Badge variant="destructive" className="text-xs">Deleted</Badge>;
  if (data.isBlocked)
    return <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">Blocked</Badge>;
  return data.isActive ? (
    <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Active</Badge>
  ) : (
    <Badge variant="secondary" className="text-xs">Inactive</Badge>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface StudentProfileHeaderProps {
  data: StudentProfile;
  actionLoading?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onBlock?: () => void;
  onUnblock?: () => void;
  onSoftDelete?: () => void;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
}

export function StudentProfileHeader({
  data,
  actionLoading,
  onActivate,
  onDeactivate,
  onBlock,
  onUnblock,
  onSoftDelete,
  onRestore,
  onPermanentDelete,
}: StudentProfileHeaderProps) {
  const [confirmType, setConfirmType] = useState<ConfirmType>(null);
  const [deletePrompt, setDeletePrompt] = useState("");

  const initials =
    data.fullName
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "DN";

  const config = confirmType ? CONFIRM_CONFIGS[confirmType] : null;

  const handleConfirm = () => {
    if (!confirmType) return;
    const actions: Record<NonNullable<ConfirmType>, (() => void) | undefined> = {
      deactivate: onDeactivate,
      block: onBlock,
      "soft-delete": onSoftDelete,
      "permanent-delete": onPermanentDelete,
    };
    actions[confirmType]?.();
    setConfirmType(null);
    setDeletePrompt("");
  };

  const closeDialog = () => {
    setConfirmType(null);
    setDeletePrompt("");
  };

  return (
    <>
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto w-full px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left: back + avatar + info */}
            <div className="flex items-start gap-4">
              <Link href="/dashboard/students">
                <Button variant="ghost" size="icon" className="mt-1 shrink-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>

              <Avatar className="h-16 w-16 border-2 border-border shrink-0 mt-1">
                <AvatarImage alt={data.fullName} src={(data as any).avatar || ""} />
                <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
              </Avatar>

              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold leading-tight">{data.fullName}</h1>
                  <StatusBadges data={data} />
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="font-mono font-medium text-foreground">{data.studentId}</span>
                  {(data as any).class?.className && (
                    <>
                      <span className="text-border">•</span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {(data as any).class.className}
                      </span>
                    </>
                  )}
                  {data.branch && (
                    <>
                      <span className="text-border">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {data.branch}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {data.dateOfBirth && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Born {format(new Date(data.dateOfBirth), "dd LLL yyyy")}
                    </span>
                  )}
                  {(data as any).admissionDate && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      Admitted {format(new Date((data as any).admissionDate), "dd LLL yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0" disabled={actionLoading}>
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Activate / Deactivate */}
                {data.isActive ? (
                  <DropdownMenuItem
                    className="gap-2 text-orange-600 focus:text-orange-600"
                    onClick={() => setConfirmType("deactivate")}
                  >
                    <UserMinus className="h-4 w-4" />
                    Deactivate
                  </DropdownMenuItem>
                ) : (
                  !data.isDeleted && (
                    <DropdownMenuItem className="gap-2" onClick={onActivate}>
                      <UserCheck className="h-4 w-4" />
                      Activate
                    </DropdownMenuItem>
                  )
                )}

                {/* Block / Unblock */}
                {!data.isDeleted && (
                  data.isBlocked ? (
                    <DropdownMenuItem className="gap-2" onClick={onUnblock}>
                      <ShieldOff className="h-4 w-4" />
                      Unblock
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="gap-2 text-orange-600 focus:text-orange-600"
                      onClick={() => setConfirmType("block")}
                    >
                      <Lock className="h-4 w-4" />
                      Block
                    </DropdownMenuItem>
                  )
                )}

                <DropdownMenuSeparator />

                {/* Soft Delete / Restore */}
                {data.isDeleted ? (
                  <DropdownMenuItem className="gap-2" onClick={onRestore}>
                    <RotateCcw className="h-4 w-4" />
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => setConfirmType("soft-delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                    Soft Delete
                  </DropdownMenuItem>
                )}

                {/* Permanent Delete */}
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={() => setConfirmType("permanent-delete")}
                >
                  <Trash2 className="h-4 w-4" />
                  Permanent Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={!!confirmType} onOpenChange={(open) => !open && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{config?.title}</AlertDialogTitle>
            <AlertDialogDescription>{config?.description}</AlertDialogDescription>
          </AlertDialogHeader>

          {config?.requireTyping && (
            <div className="space-y-2 py-2">
              <Label htmlFor="confirm-input" className="text-sm font-medium text-muted-foreground">
                Type <span className="font-bold text-foreground">DELETE</span> to confirm
              </Label>
              <Input
                id="confirm-input"
                autoFocus
                value={deletePrompt}
                onChange={(e) => setDeletePrompt(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={config?.requireTyping ? deletePrompt !== "DELETE" : false}
              className={
                config?.destructive
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {config?.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
