"use client";

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
import { IUpdateStudent } from "@/validations";
import {
  Addresses,
  permanentAddress,
  presentAddress,
} from "@/validations/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { EditableSection } from "./editableSection";

interface AddressSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: Addresses;
  onSave?: (data: IUpdateStudent) => Promise<void>;
}

export function AddressSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: AddressSectionProps) {
  const form = useForm<Addresses>({
    resolver: zodResolver(presentAddress.merge(permanentAddress)),
    defaultValues: {
      presentAddress: {
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
        presentAddress: {
          village: data?.presentAddress?.village ?? "",
          postOffice: data?.presentAddress?.postOffice ?? "",
          upazila: data?.presentAddress?.upazila ?? "",
          district: data?.presentAddress?.district ?? "",
          division: data?.presentAddress?.division ?? "",
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

  const handleSave = async (formData: Addresses) => {
    try {
      if (onSave) {
        await onSave(formData);
      }
      onEditChange(false);
    } catch (error) {
      console.error("Error saving address:", error);
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
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Present Address */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground">
                  Present Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="presentAddress.village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village </FormLabel>
                        <FormControl>
                          <Input placeholder="Village" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="presentAddress.postOffice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Office (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Post Office" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="presentAddress.upazila"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upazila</FormLabel>
                        <FormControl>
                          <Input placeholder="Upazila" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="presentAddress.district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <FormControl>
                          <Input placeholder="District" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="presentAddress.division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Division (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Division" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Permanent Address */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground">
                  Permanent Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="permanentAddress.village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village </FormLabel>
                        <FormControl>
                          <Input placeholder="Village" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permanentAddress.postOffice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Office (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Post Office" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="permanentAddress.upazila"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upazila</FormLabel>
                        <FormControl>
                          <Input placeholder="Upazila" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="permanentAddress.district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <FormControl>
                          <Input placeholder="District" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="permanentAddress.division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Division (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Division" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      ) : (
        <CardContent className="space-y-6">
          {/* Present Address Display */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              Present Address
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Village</p>
                <p className="font-medium">
                  {data?.presentAddress?.village || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Post Office</p>
                <p className="font-medium">
                  {data?.presentAddress?.postOffice || "N/A"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-sm text-muted-foreground">Upazila</p>
                <p className="font-medium">
                  {data?.presentAddress?.upazila || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">District</p>
                <p className="font-medium">
                  {data?.presentAddress?.district || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Permanent Address Display */}
          {data?.permanentAddress && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">
                Permanent Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Village</p>
                  <p className="font-medium">
                    {data.permanentAddress?.village || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Post Office</p>
                  <p className="font-medium">
                    {data.permanentAddress?.postOffice || "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-sm text-muted-foreground">Upazila</p>
                  <p className="font-medium">
                    {data.permanentAddress?.upazila || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">District</p>
                  <p className="font-medium">
                    {data.permanentAddress?.district || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </EditableSection>
  );
}
