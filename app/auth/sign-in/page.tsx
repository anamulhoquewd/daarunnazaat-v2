import { LoginForm } from "@/components/auth/login-form";
import SuspenseFallback from "@/components/auth/suspense";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <Suspense fallback={<SuspenseFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
