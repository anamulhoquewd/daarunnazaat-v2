import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function PickDate({
  form,
  disabled,
  name,
  label,
}: {
  form: any;
  disabled?: boolean;
  name: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date | undefined>(date);
  const [value, setValue] = useState(formatDate(date));

  const fieldValue = form.watch(name); // 👈 form value access করা

  // 🟢 useEffect এখন টপ-লেভেলে আছে
  useEffect(() => {
    if (fieldValue) {
      const existingDate = new Date(fieldValue);
      if (isValidDate(existingDate)) {
        setDate(existingDate);
        setMonth(existingDate);
        setValue(formatDate(existingDate));
      }
    }
  }, [fieldValue]);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="cursor-pointer">{label}</FormLabel>
          <FormControl>
            <div className="relative flex gap-2">
              <Input
                id="date"
                value={value}
                placeholder="June 01, 2025"
                className="bg-background pr-10"
                disabled={disabled}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const newDate = new Date(inputValue);
                  setValue(inputValue);
                  if (isValidDate(newDate)) {
                    setDate(newDate);
                    setMonth(newDate);
                    field.onChange(newDate);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" && !disabled) {
                    e.preventDefault();
                    setOpen(true);
                  }
                }}
              />

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date-picker"
                    variant="ghost"
                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                    disabled={disabled}
                  >
                    <CalendarIcon className="size-3.5" />
                    <span className="sr-only">Select date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="end"
                  alignOffset={-8}
                  sideOffset={10}
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    required
                    captionLayout="dropdown"
                    month={month}
                    onMonthChange={setMonth}
                    onSelect={(date: Date) => {
                      if (!disabled && date) {
                        setDate(date);
                        setValue(formatDate(date));
                        setOpen(false);
                        field.onChange(date);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
