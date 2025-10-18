"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import useMe from "@/hooks/auth/use-me";
import ChangePassword from "@/components/admins/change-password";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PickDate from "@/components/pick-date";

function Me() {
  const {
    form,
    handleUpdate,
    isLoading,
    passwordOpen,
    setpasswordOpen,
    isEditing,
    setIsEditing,
  } = useMe();

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Stay in Control of Your Profile</h1>
      <p className="text-gray-500 text-sm mb-8">
        Manage your Personal information.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Keep your profile information up to date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdate)}
              className="space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-2 items-start">
                <FormField
                  control={form.control}
                  name={"name"}
                  disabled={!isEditing}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="cursor-pointer">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Type your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={"phone"}
                  disabled={!isEditing}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="cursor-pointer">Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Type your phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <PickDate
                  name="join_date"
                  label="Joining date"
                  disabled={!isEditing}
                  form={form}
                />

                <FormField
                  control={form.control}
                  name={"address"}
                  disabled={!isEditing}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="cursor-pointer">Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Type your address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between items-center">
                <Button
                  onClick={() => setpasswordOpen(true)}
                  className="cursor-pointer"
                >
                  Change Password
                </Button>
                <div className="w-full flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        className="cursor-pointer"
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button className="cursor-pointer" type="submit">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="cursor-pointer"
                      type="button"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ChangePassword
        isOpen={passwordOpen}
        onClose={() => setpasswordOpen(false)}
      />
    </div>
  );
}

export default Me;
