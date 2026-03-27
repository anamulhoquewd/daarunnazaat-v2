import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function generatePeriods(yearsBack = 1, yearsForward = 1) {
  const periods: { value: string; label: string }[] = [];

  const now = new Date();
  const startYear = now.getFullYear() - yearsBack;
  const endYear = now.getFullYear() + yearsForward;

  for (let year = endYear; year >= startYear; year--) {
    for (let month = 11; month >= 0; month--) {
      const date = new Date(year, month);

      const value = format(date, "yyyy-MM");
      const label = format(date, "MMMM yyyy");

      periods.push({ value, label });
    }
  }

  return periods;
}

const periods = generatePeriods();

export function PeriodPicker({ form, onPeriodChange }: { form: any; onPeriodChange?: (value: string) => void }) {
  return (
    <FormItem>
      <FormLabel>Period</FormLabel>

      <Select
        value={form.watch("period")}
        onValueChange={(value) => {
          form.setValue("period", value);
          if (onPeriodChange) {
            onPeriodChange(value);
          }
        }}
      >
        <FormControl>
          <SelectTrigger className="w-full">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
        </FormControl>

        <SelectContent className="max-h-[300px]">
          {periods.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FormMessage />
    </FormItem>
  );
}