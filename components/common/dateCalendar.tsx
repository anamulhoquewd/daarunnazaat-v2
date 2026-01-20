import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function DateField({ name, lable }: { name: string; lable: string }) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(new Date());

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormItem>
          <Label htmlFor={name}>{lable}</Label>
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Input
                  id="date"
                  value={
                    field.value
                      ? formatDate(field.value)
                      : formatDate(new Date())
                  }
                  placeholder="June 01, 2025"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setOpen(true);
                    }
                  }}
                />
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  month={month}
                  captionLayout="dropdown" // 🔥 month + year dropdown
                  onMonthChange={setMonth}
                  onSelect={(date) => {
                    field.onChange(date); // update form value
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage>{fieldState?.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
}
