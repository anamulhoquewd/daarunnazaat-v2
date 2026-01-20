"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Addresses, addressesSchema } from "@/validations/student";
import { EditableSection } from "./editableSection";

interface AddressSectionProps {
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  data?: Addresses;
  onSave?: (data: Addresses) => Promise<void>;
}

export function AddressSection({
  isEditing,
  onEditChange,
  data,
  onSave,
}: AddressSectionProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Addresses>({
    resolver: zodResolver(addressesSchema),
    defaultValues: data || {
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
      isEditing={isEditing}
      onEdit={() => onEditChange(true)}
      onCancel={() => {
        reset();
        onEditChange(false);
      }}
      onSave={handleSubmit(handleSave)}
    >
      {isEditing ? (
        <form className="space-y-6">
          {/* Present Address */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              Present Address
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="presentVillage">Village</Label>
                <Input
                  id="presentVillage"
                  placeholder="Village"
                  {...register("presentAddress.village")}
                />
                {errors.presentAddress?.village && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.presentAddress.village.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="presentPostOffice">Post Office</Label>
                <Input
                  id="presentPostOffice"
                  placeholder="Post office"
                  {...register("presentAddress.postOffice")}
                />
                {errors.presentAddress?.postOffice && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.presentAddress.postOffice.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="presentUpazila">Upazila</Label>
                <Input
                  id="presentUpazila"
                  placeholder="Upazila"
                  {...register("presentAddress.upazila")}
                />
                {errors.presentAddress?.upazila && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.presentAddress.upazila.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="presentDistrict">District</Label>
                <Input
                  id="presentDistrict"
                  placeholder="District"
                  {...register("presentAddress.district")}
                />
                {errors.presentAddress?.district && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.presentAddress.district.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="presentDivision">Division (Optional)</Label>
              <Input
                id="presentDivision"
                placeholder="Division"
                {...register("presentAddress.division")}
              />
            </div>
          </div>

          {/* Permanent Address */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              Permanent Address
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="permanentVillage">Village</Label>
                <Input
                  id="permanentVillage"
                  placeholder="Village"
                  {...register("permanentAddress.village")}
                />
              </div>
              <div>
                <Label htmlFor="permanentPostOffice">Post Office</Label>
                <Input
                  id="permanentPostOffice"
                  placeholder="Post office"
                  {...register("permanentAddress.postOffice")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="permanentUpazila">Upazila</Label>
                <Input
                  id="permanentUpazila"
                  placeholder="Upazila"
                  {...register("permanentAddress.upazila")}
                />
              </div>
              <div>
                <Label htmlFor="permanentDistrict">District</Label>
                <Input
                  id="permanentDistrict"
                  placeholder="District"
                  {...register("permanentAddress.district")}
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="permanentDivision">Division (Optional)</Label>
              <Input
                id="permanentDivision"
                placeholder="Division"
                {...register("permanentAddress.division")}
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Present Address Display */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              Present Address
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Village</p>
                <p className="font-medium">
                  {data?.presentAddress.village || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Post Office</p>
                <p className="font-medium">
                  {data?.presentAddress.postOffice || "N/A"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-sm text-muted-foreground">Upazila</p>
                <p className="font-medium">
                  {data?.presentAddress.upazila || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">District</p>
                <p className="font-medium">
                  {data?.presentAddress.district || "N/A"}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Village</p>
                  <p className="font-medium">
                    {data.permanentAddress.village || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Post Office</p>
                  <p className="font-medium">
                    {data.permanentAddress.postOffice || "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-sm text-muted-foreground">Upazila</p>
                  <p className="font-medium">
                    {data.permanentAddress.upazila || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">District</p>
                  <p className="font-medium">
                    {data.permanentAddress.district || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </EditableSection>
  );
}
