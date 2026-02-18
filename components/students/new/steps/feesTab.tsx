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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethod, PaymentSource } from "@/validations";
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="admissionFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admission Fee</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    name={field.name}
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ?? Number(e.target.value))
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="receivedAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Received Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    name={field.name}
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ?? Number(e.target.value))
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="monthlyFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Fee</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    name={field.name}
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ?? Number(e.target.value))
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="coachingFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coaching Fee</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    name={field.name}
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ?? Number(e.target.value))
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="daycareFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daycare Fee</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    name={field.name}
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ?? Number(e.target.value))
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
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
                    <Input
                      type="number"
                      placeholder="0"
                      name={field.name}
                      value={field.value != null ? String(field.value) : ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ?? Number(e.target.value))
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isMealIncluded && (
            <FormField
              control={control}
              name="mealFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Fee</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      name={field.name}
                      value={field.value != null ? String(field.value) : ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ?? Number(e.target.value))
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <FormField
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment method *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={"cash"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(PaymentMethod).map(([key, value]) => (
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
          name="paymentSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Source</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={"office"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(PaymentSource).map(([key, value]) => (
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
      </CardContent>
    </Card>
  );
}

export default FeesTab;
