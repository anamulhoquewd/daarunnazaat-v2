"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { IUser, UserRole } from "@/validations";
import { useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { RoleMultiSelect } from "./roleMultiSelect";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandGroup, CommandItem } from "../ui/command";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Staff", value: "staff" },
  { label: "Guardian", value: "guardian" },
];

export default function UserRegistrationForm({
  form,
  handleSubmit,
  isLoading,
  values,
  setIsAddOpen,
}: {
  isLoading: boolean;
  handleSubmit: (data: IUser) => Promise<void>;
  form: any;
  values: IUser | null;
  setIsAddOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  useEffect(() => {
    if (values) {
      form.reset(values, {
        keepDirty: false,
        keepTouched: false,
      });
    }
  }, [values]);

  const toggleRole = (role: string) => {
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
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input placeholder="fnfo@darunnazat.com" {...field} />
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
                {form.watch("roles") && Array.isArray(form.watch("roles"))
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
                      onSelect={() => toggleRole(role.value)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          form.watch("roles")?.includes(role.value)
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

          <div className="flex justify-end pt-6 gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                form.reset({ email: "", phone: "" });
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
