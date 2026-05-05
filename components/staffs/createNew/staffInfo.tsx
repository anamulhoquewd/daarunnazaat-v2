import { DateField } from "@/components/common/dateCalendar";
import BranchMultiSelect from "@/components/staffs/createNew/branchMultiSelect";
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
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

function StaffInformation() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Staff Details</CardTitle>
        <CardDescription>
          Role, department, salary and branch information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Shaikhul Hadees, Teacher"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Hadees, Fiqh" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DateField name="joinDate" label="Join Date *" />
          <FormField
            control={control}
            name="baseSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Salary *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Monthly salary in "
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value !== "" ? Number(e.target.value) : "",
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch *</FormLabel>
              <BranchMultiSelect
                value={field.value ?? []}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export { StaffInformation };
