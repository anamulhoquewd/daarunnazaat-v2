"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormProvider } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useUserQuery from "@/hooks/users/useUser";
import { UserRole } from "@/validations";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Staff", value: "staff" },
  { label: "Guardian", value: "guardian" },
];

export default function UserRegistrationPage() {
  const { form, handleSubmit, isLoading } = useUserQuery();

  const toggleRole = (role: UserRole) => {
    const normalized =
      form.watch("roles") && Array.isArray(form.watch("roles"))
        ? form.watch("roles").filter((r: string) => r && r.trim().length > 0)
        : [];

    if (normalized.includes(role)) {
      // toggle the role off
      const next = normalized.filter((r: string) => r !== role);
      form.setValue("roles", next);
      return;
    }

    form.setValue("roles", [...normalized, role]);
  };

  return (
    <main className="w-full flex flex-col overflow-hidden gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          User Registration
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Complete all sections to register for the upcoming session
        </p>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              handleSubmit(data as Parameters<typeof handleSubmit>[0]),
            )}
            className="space-y-8"
          >
            <Card>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="anam@gmail.com" {...field} />
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
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="01XXXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between capitalize"
                      >
                        {form.watch("roles") &&
                        Array.isArray(form.watch("roles"))
                          ? form.watch("roles").join(", ")
                          : "Select roles"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandGroup>
                          {roles.map((role) => (
                            <CommandItem
                              key={role.value}
                              onSelect={() =>
                                toggleRole(role.value as UserRole)
                              }
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  form
                                    .watch("roles")
                                    ?.includes(role.value as UserRole)
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              {role.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </form>
        </Form>
      </FormProvider>
    </main>
  );
}
