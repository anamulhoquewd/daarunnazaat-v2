import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

function FeesTab() {
  const { control, watch } = useFormContext();

  const isResidential = watch("isResidential");
  const isMealIncluded = watch("isMealIncluded");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Fee Information</CardTitle>
        <CardDescription>Enter all applicable fees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm sm:text-base">
            Additional Options
          </h3>
          <div className="space-y-3">
            <FormField
              control={control}
              name="isResidential"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Is Residential Student
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="isMealIncluded"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Meal Included
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            control={control}
            name="admissionFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admission Fee *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            control={control}
            name="monthlyFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Fee *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isResidential && (
            <FormField
              control={control}
              name="residentialFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Residential Fee</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {isMealIncluded && (
          <FormField
            control={control}
            name="mealFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meal Fee</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default FeesTab;
