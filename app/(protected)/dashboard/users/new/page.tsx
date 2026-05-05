"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useUserQuery from "@/hooks/users/useUser";
import { UserRole } from "@/validations";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { FormProvider } from "react-hook-form";

const ROLES: { label: string; value: UserRole; description: string }[] = [
  { label: "Admin", value: UserRole.ADMIN, description: "Full system access" },
  { label: "Staff", value: UserRole.STAFF, description: "Teacher / employee access" },
  { label: "Guardian", value: UserRole.GUARDIAN, description: "Parent / guardian portal" },
];

export default function UserRegistrationPage() {
  const { form, handleSubmit, isLoading } = useUserQuery();

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
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/users">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create User</h1>
          <p className="text-sm text-muted-foreground">Add a new system user account</p>
        </div>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              handleSubmit(data as Parameters<typeof handleSubmit>[0])
            )}
            className="space-y-4"
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="user@example.com" {...field} />
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="roles"
                  render={() => (
                    <FormItem className="space-y-3">
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
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Clear
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}
