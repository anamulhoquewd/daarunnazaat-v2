import { ResetPasswordForm } from "@/components/auth/resetForm";
import SuspenseFallback from "@/components/auth/suspense";
import { Suspense } from "react";

function ResetPassword() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a new password for your account
          </p>
        </div>
        <Suspense fallback={<SuspenseFallback />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

export default ResetPassword;
