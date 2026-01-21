"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Edit2, X } from "lucide-react";

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
    <Card className="p-6 border border-border">
      <div className="flex items-center justify-between">
        <CardHeader className="flex-1">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isSaving}
                className="gap-2 bg-transparent"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>
      <div className={isEditing ? "space-y-4" : ""}>{children}</div>
    </Card>
  );
}
