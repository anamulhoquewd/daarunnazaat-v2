import { ForgotForm } from "@/components/auth/forgot-form";
import SuspenseFallback from "@/components/auth/suspense";
import { Suspense } from "react";

export default function Forgot() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </p>
        </div>
        <Suspense fallback={<SuspenseFallback />}>
          <ForgotForm />
        </Suspense>
      </div>
    </div>
  );
}
