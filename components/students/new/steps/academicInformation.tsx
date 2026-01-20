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
import { BatchType, Branch } from "@/validations";
import { useFormContext } from "react-hook-form";
import { ClassCombobox } from "../classCombobox";
import { SessionCombobox } from "../sessionCombobox";

function AcademicInformation() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Academic Details</CardTitle>
        <CardDescription>Program and session information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            control={control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(Branch).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="batchType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(BatchType).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <DateField name="admissionDate" label="Admission Date" />

          <FormField
            control={control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class *</FormLabel>
                <FormControl>
                  <ClassCombobox
                    value={field.value}
                    onChange={field.onChange}
                  />
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
                  <SessionCombobox
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

export default AcademicInformation;
