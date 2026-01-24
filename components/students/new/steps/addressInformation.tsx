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

function AddressInformation() {
  const { control } = useFormContext();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Present Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FormField
              control={control}
              name="presentAddress.village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Village *</FormLabel>
                  <FormControl>
                    <Input placeholder="Village name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="presentAddress.postOffice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Office *</FormLabel>
                  <FormControl>
                    <Input placeholder="Post office name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FormField
              control={control}
              name="presentAddress.upazila"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upazila *</FormLabel>
                  <FormControl>
                    <Input placeholder="Upazila name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="presentAddress.district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District *</FormLabel>
                  <FormControl>
                    <Input placeholder="District name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="presentAddress.division"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Division</FormLabel>
                <FormControl>
                  <Input placeholder="Division name (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Permanent Address
          </CardTitle>
          <CardDescription>
            Leave blank if same as present address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FormField
              control={control}
              name="permanentAddress.village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Village</FormLabel>
                  <FormControl>
                    <Input placeholder="Village name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="permanentAddress.postOffice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Office</FormLabel>
                  <FormControl>
                    <Input placeholder="Post office name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FormField
              control={control}
              name="permanentAddress.upazila"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upazila</FormLabel>
                  <FormControl>
                    <Input placeholder="Upazila name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="permanentAddress.district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <FormControl>
                    <Input placeholder="District name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="permanentAddress.division"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Division</FormLabel>
                <FormControl>
                  <Input placeholder="Division name (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </>
  );
}

export default AddressInformation;
