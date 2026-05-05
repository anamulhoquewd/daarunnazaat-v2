import { DateField } from "@/components/common/dateCalendar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Branch } from "@/validations";
import { useFormContext } from "react-hook-form";
import { ClassCombobox } from "../classCombobox";
import { SessionCombobox } from "../sessionCombobox";

const BRANCH_OPTIONS = Object.entries(Branch).filter(
  ([key]) => !key.endsWith("_BRANCH")
);

function AcademicInformation() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Academic Details</CardTitle>
        <CardDescription>Branch, class, and session information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BRANCH_OPTIONS.map(([, value]) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DateField name="admissionDate" label="Admission Date" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class *</FormLabel>
                <FormControl>
                  <ClassCombobox value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="currentSessionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session *</FormLabel>
                <FormControl>
                  <SessionCombobox value={field.value} onChange={field.onChange} />
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

export default AcademicInformation;
