"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IUser, UserRole } from "@/validations";
import { Loader2, Shield } from "lucide-react";
import { useEffect } from "react";
import { FormProvider } from "react-hook-form";

const ROLES: { label: string; value: UserRole; description: string }[] = [
  { label: "Admin", value: UserRole.ADMIN, description: "Full system access" },
  { label: "Staff", value: UserRole.STAFF, description: "Teacher / employee access" },
  { label: "Guardian", value: UserRole.GUARDIAN, description: "Parent / guardian portal" },
];

export default function UserRegistrationForm({
  form,
  handleSubmit,
  isLoading,
  values,
  setIsAddOpen,
  isEditing,
}: {
  isLoading: boolean;
  handleSubmit: (data: any) => Promise<void>;
  form: any;
  values: IUser | null;
  setIsAddOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditing?: boolean;
}) {
  useEffect(() => {
    if (values) {
      form.reset(values, { keepDirty: false, keepTouched: false });
    }
  }, [values]);

  const toggleRole = (role: UserRole) => {
    const current: UserRole[] = Array.isArray(form.getValues("roles"))
      ? form.getValues("roles").filter((r: string) => r?.trim())
      : [];
    const next = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    form.setValue("roles", next, { shouldValidate: true });
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {/* Account Fields */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      disabled={isEditing}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="01XXXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Role selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4" />
              Roles
            </div>
            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem className="space-y-2">
                  {ROLES.map((role) => {
                    const selected: UserRole[] = Array.isArray(form.watch("roles"))
                      ? form.watch("roles")
                      : [];
                    const isChecked = selected.includes(role.value);
                    return (
                      <label
                        key={role.value}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleRole(role.value)}
                          className="mt-0.5"
                        />
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{role.label}</span>
                            {isChecked && (
                              <Badge variant="secondary" className="text-xs h-4 px-1.5">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                      </label>
                    );
                  })}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddOpen(false);
                form.reset({ email: "", phone: "", roles: [] });
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5">
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
