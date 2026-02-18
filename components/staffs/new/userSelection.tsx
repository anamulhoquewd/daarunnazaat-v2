"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { StaffUserCombobox } from "./staffUserCombobox";

function StaffUserSelection() {
  const { control } = useFormContext();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">User Selection</CardTitle>
        <CardDescription>
          Select the user associated with this staff
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            control={control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User *</FormLabel>
                <FormControl>
                  <StaffUserCombobox
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default StaffUserSelection;
