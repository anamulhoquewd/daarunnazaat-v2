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

function FeeNumberInput({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required ? " *" : ""}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={0}
              placeholder="0"
              name={field.name}
              value={field.value != null ? String(field.value) : ""}
              onChange={(e) =>
                field.onChange(e.target.value !== "" ? Number(e.target.value) : undefined)
              }
              onBlur={field.onBlur}
              ref={field.ref}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FeesTab() {
  const { control, watch } = useFormContext();

  const isResidential = watch("isResidential");
  const isMealIncluded = watch("isMealIncluded");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Fee Information</CardTitle>
        <CardDescription>Enter monthly rates and initial payment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Options first */}
        <div className="flex flex-wrap gap-6">
          <FormField
            control={control}
            name="isResidential"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal cursor-pointer">Residential student</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="isMealIncluded"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal cursor-pointer">Meal included</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Fee rates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeeNumberInput name="admissionFee" label="Admission Fee" />
          <FeeNumberInput name="monthlyFee" label="Monthly Fee" />
          <FeeNumberInput name="coachingFee" label="Coaching Fee" />
          <FeeNumberInput name="daycareFee" label="Daycare Fee" />
          {isResidential && <FeeNumberInput name="residentialFee" label="Residential Fee" />}
          {isMealIncluded && <FeeNumberInput name="mealFee" label="Meal Fee" />}
        </div>

        {/* Initial payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
          <FeeNumberInput name="receivedAmount" label="Received Amount (Admission)" />

          <FormField
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? "cash"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PaymentMethod).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {key.replace(/_/g, " ")}
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
                <Select onValueChange={field.onChange} value={field.value ?? "office"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PaymentSource).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {key.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default FeesTab;
