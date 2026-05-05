import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Copy } from "lucide-react";
import { useFormContext } from "react-hook-form";

const ADDRESS_FIELDS = [
  {
    name: "village",
    label: "Village / Area",
    placeholder: "Village name",
    required: true,
  },
  {
    name: "postOffice",
    label: "Post Office",
    placeholder: "Post office name",
    required: true,
  },
  {
    name: "upazila",
    label: "Upazila",
    placeholder: "Upazila name",
    required: true,
  },
  {
    name: "district",
    label: "District",
    placeholder: "District name",
    required: true,
  },
  {
    name: "division",
    label: "Division",
    placeholder: "Division (optional)",
    required: false,
  },
] as const;

function AddressInformation() {
  const { control, getValues, setValue } = useFormContext();

  const copyPresentToPermanent = () => {
    const present = getValues("address");
    setValue("permanentAddress.village", present?.village ?? "", {
      shouldDirty: true,
    });
    setValue("permanentAddress.postOffice", present?.postOffice ?? "", {
      shouldDirty: true,
    });
    setValue("permanentAddress.upazila", present?.upazila ?? "", {
      shouldDirty: true,
    });
    setValue("permanentAddress.district", present?.district ?? "", {
      shouldDirty: true,
    });
    setValue("permanentAddress.division", present?.division ?? "", {
      shouldDirty: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Address Information</CardTitle>
        <CardDescription>
          Present and permanent address of the student
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Present Address */}
        <div>
          <p className="text-sm font-medium mb-3">Present Address</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ADDRESS_FIELDS.map(({ name, label, placeholder, required }) => (
              <FormField
                key={name}
                control={control}
                name={`address.${name}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {label}
                      {required && " *"}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Permanent Address */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Permanent Address</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyPresentToPermanent}
              className="gap-1.5 h-7 text-xs"
            >
              <Copy className="h-3 w-3" />
              Same as present
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ADDRESS_FIELDS.map(({ name, label, placeholder }) => (
              <FormField
                key={name}
                control={control}
                name={`permanentAddress.${name}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input placeholder={placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AddressInformation;
