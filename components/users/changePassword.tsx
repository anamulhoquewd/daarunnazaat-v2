"use client";

import type React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import useChangePassword from "@/hooks/auth/useChangePassword";
import { PasswordInputField } from "./passwordInputField";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ChangePassword({ isOpen, onClose }: PasswordChangeModalProps) {
  const {
    form,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    onSubmit,
    setShowCurrentPassword,
    setShowNewPassword,
    setShowConfirmPassword,
  } = useChangePassword(onClose);

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new password to update your
            credentials.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="sm:max-w-[500px] overflow-hidden pr-2 md:px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PasswordInputField
                form={form}
                showPassword={showCurrentPassword}
                setShowPassword={setShowCurrentPassword}
                name="currentPassword"
                placeholder="Type your current password"
                label="Current Password"
              />
              <PasswordInputField
                form={form}
                showPassword={showNewPassword}
                setShowPassword={setShowNewPassword}
                name="newPassword"
                placeholder="Type your new password"
                label="New Password"
              />
              <PasswordInputField
                form={form}
                showPassword={showConfirmPassword}
                setShowPassword={setShowConfirmPassword}
                name="confirmPassword"
                placeholder="Type your confirm password"
                label="Confirm Password"
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="outline"
                    disabled={false}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  className="cursor-pointer"
                  type="submit"
                  disabled={false}
                >
                  {false ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
          <ScrollBar orientation="vertical" className="w-2.5" />
          <ScrollBar orientation="horizontal" className="w-2.5" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ChangePassword;
