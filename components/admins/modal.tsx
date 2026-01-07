import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RegistrationForm from "./form";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { IAdmin } from "@/interfaces";

interface IProps {
  form: any;
  isOpen: boolean;
  setValues?: (values: any) => void;
  setIsOpen: (isOpen: boolean) => void;
  values?: IAdmin | null;
  isLoading: boolean;
  onSubmit: any;
  isEditing?: boolean;
}

function AddModal({
  form,
  isOpen,
  setValues,
  setIsOpen,
  values,
  isLoading,
  onSubmit,
  isEditing,
}: IProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          form.reset({
            name: "",
            email: "",
            phone: "",
            role: "admin",
            is_active: true,
            isBlocked: false,
            join_date: new Date(),
            address: "",
            designation: "",
          });
          if (setValues) setValues(null);
        }
        setIsOpen(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Users Registration Form</DialogTitle>
          <DialogDescription>
            Fill out the form below to complete new user registration.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="sm:max-w-[525px] h-[65dvh] overflow-hidden pr-2 md:px-4">
          <RegistrationForm
            form={form}
            values={values}
            onSubmit={onSubmit}
            isLoading={isLoading}
            isEditing={isEditing}
          />
          <ScrollBar orientation="vertical" className="w-2.5" />
          <ScrollBar orientation="horizontal" className="w-2.5" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default AddModal;
