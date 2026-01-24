"use client";


import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useReset from "@/hooks/auth/useResetPassword";
import Link from "next/link";
import SuccessComponent from "./resetSuccess";

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { form, handleSubmit, isLoading, isSuccess, error } = useReset();

  if (isSuccess) {
    return <SuccessComponent />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create New Password</CardTitle>
        <CardDescription>
          Your new password must be different from previously used passwords
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="relative">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <div className="relative flex items-center">
                      <FormControl className="w-full">
                        <Input
                          placeholder="Type your password"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="pr-10" // Extra right padding for icon space
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 text-muted-foreground cursor-pointer"
                        onMouseDown={() => setShowPassword(!showPassword)}
                        onMouseUp={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="relative">
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative flex items-center">
                      <FormControl className="w-full">
                        <Input
                          placeholder="Type your password"
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                          className="pr-10" // Extra right padding for icon space
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 text-muted-foreground cursor-pointer"
                        onMouseDown={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        onMouseUp={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                        <span className="sr-only">
                          {showConfirmPassword
                            ? "Hide password"
                            : "Show password"}
                        </span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {error && (
              <span className="text-destructive text-sm -full flex justify-center">
                {error}
              </span>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href="/auth/sign-in"
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
