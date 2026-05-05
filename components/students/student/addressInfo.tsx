"use client";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { IUpdateStudent } from "@/validations";
import { Addresses, permanentAddress, address } from "@/validations/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { EditableSection } from "./editableSection";

interface AddressSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: any;
  onSave?: (data: IUpdateStudent) => Promise<void>;
}

const ADDRESS_FIELDS = [
  { name: "village" as const, label: "Village / Area" },
  { name: "postOffice" as const, label: "Post Office" },
  { name: "upazila" as const, label: "Upazila" },
  { name: "district" as const, label: "District" },
  { name: "division" as const, label: "Division" },
];

export function AddressSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: AddressSectionProps) {
  const form = useForm<Addresses>({
    resolver: zodResolver(address.merge(permanentAddress)),
    defaultValues: {
      address: {
        village: "",
        postOffice: "",
        upazila: "",
        district: "",
        division: "",
      },
      permanentAddress: {
        village: "",
        postOffice: "",
        upazila: "",
        district: "",
        division: "",
      },
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        address: {
          village: data?.address?.village ?? "",
          postOffice: data?.address?.postOffice ?? "",
          upazila: data?.address?.upazila ?? "",
          district: data?.address?.district ?? "",
          division: data?.address?.division ?? "",
        },
        permanentAddress: {
          village: data?.permanentAddress?.village ?? "",
          postOffice: data?.permanentAddress?.postOffice ?? "",
          upazila: data?.permanentAddress?.upazila ?? "",
          district: data?.permanentAddress?.district ?? "",
          division: data?.permanentAddress?.division ?? "",
        },
      });
    }
  }, [data, form.reset]);

  const copyPresentToPermanent = () => {
    const present = form.getValues("address");
    form.setValue("permanentAddress.village", present?.village ?? "", {
      shouldDirty: true,
    });
    form.setValue("permanentAddress.postOffice", present?.postOffice ?? "", {
      shouldDirty: true,
    });
    form.setValue("permanentAddress.upazila", present?.upazila ?? "", {
      shouldDirty: true,
    });
    form.setValue("permanentAddress.district", present?.district ?? "", {
      shouldDirty: true,
    });
    form.setValue("permanentAddress.division", present?.division ?? "", {
      shouldDirty: true,
    });
  };

  const handleSave = async (formData: Addresses) => {
    try {
      await onSave?.(formData);
      onEditChange(false);
    } catch {
      // error handled by parent
    }
  };

  return (
    <EditableSection
      title="Address Information"
      isSaving={form.formState.isSubmitting}
      isEditing={isEditing}
      onEdit={() => onEditChange(true)}
      onCancel={() => {
        form.reset();
        onEditChange(false);
      }}
      onSave={form.handleSubmit(handleSave)}
    >
      {isEditing ? (
        <CardContent className="space-y-6 pt-0">
          <Form {...form}>
            <form className="space-y-6">
              {/* Present */}
              <div>
                <p className="text-sm font-medium mb-3">Present Address</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ADDRESS_FIELDS.map(({ name, label }) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={`address.${name}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input placeholder={label} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Permanent */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ADDRESS_FIELDS.map(({ name, label }) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={`permanentAddress.${name}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input placeholder={label} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      ) : (
        <CardContent className="space-y-5 pt-0">
          <AddressBlock label="Present Address" address={data?.address} />
          {data?.permanentAddress && (
            <>
              <Separator />
              <AddressBlock
                label="Permanent Address"
                address={data.permanentAddress}
              />
            </>
          )}
        </CardContent>
      )}
    </EditableSection>
  );
}

function AddressBlock({ label, address }: { label: string; address?: any }) {
  if (!address) return null;
  return (
    <div>
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {[
          ["Village / Area", address.village],
          ["Post Office", address.postOffice],
          ["Upazila", address.upazila],
          ["District", address.district],
          ["Division", address.division],
        ].map(([key, val]) =>
          val ? (
            <div key={key}>
              <p className="text-xs text-muted-foreground">{key}</p>
              <p className="text-sm font-medium">{val}</p>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
