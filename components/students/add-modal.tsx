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
import { IClass, IStudent } from "@/interfaces";

interface IProps {
  form: any;
  isOpen: boolean;
  setValues?: (values: any) => void;
  setIsOpen: (isOpen: boolean) => void;
  values?: IStudent | null;
  isLoading: boolean;
  onSubmit: any;
  isEditing?: boolean;
  classes: IClass[];
  cSearch: string;
  setCSearch: (cSearch: string) => void;
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
  classes,
  cSearch,
  setCSearch,
}: IProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          form.reset({
            name: "",
            admission_date: new Date(),
            address: "",
            class_id: "",
            date_of_birth: new Date("2002-03-30"),
            guardian_name: "",
            guardian_phone: "",
            id_card: "",
            is_active: true,
            monthly_fee: 0,
            roll: 0,
          });
          if (setValues) setValues(null);
          setCSearch("");
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
            classes={classes}
            cSearch={cSearch}
            setCSearch={setCSearch}
          />
          <ScrollBar orientation="vertical" className="w-2.5" />
          <ScrollBar orientation="horizontal" className="w-2.5" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default AddModal;
