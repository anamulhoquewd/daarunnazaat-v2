
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
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";

function EmergencyContact() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Emergency Contact</CardTitle>
        <CardDescription>Contact person in case of emergency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="emergencyContact.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="emergencyContact.relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Father, Brother" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="emergencyContact.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

            <FormField
                control={control}
                name="emergencyContact.address"
                render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="e.g., 123 Main St, City, Country"
                                {...field}
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

export default EmergencyContact;
