import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import React from "react";

function SuccessComponent({ value }: { value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h3 className="text-xl font-semibold">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-medium">{value}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            If you don&apos;t see it, check your spam folder
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default SuccessComponent;
