"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Edit2, Loader2, X } from "lucide-react";

interface EditableSectionProps {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
  isEditing: boolean;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function EditableSection({
  title,
  children,
  onEdit,
  isEditing,
  onCancel,
  onSave,
  isSaving = false,
}: EditableSectionProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex gap-2 shrink-0">
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 h-8">
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isSaving}
                className="gap-1.5 h-8"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="gap-1.5 h-8"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      {children}
    </Card>
  );
}
