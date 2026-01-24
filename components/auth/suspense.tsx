import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuspenseFallback() {
  return (
    <div className="flex items-center flex-col">
      {/* Header Skeletons: Welcome back & Sign in message */}
      <Skeleton className="h-8 w-48 mb-2 bg-gray-700" />
      <Skeleton className="h-5 w-64 mb-8 bg-gray-700" />

      <Card className="w-full max-w-md">
        <CardHeader className="border-b border-gray-700 pb-4">
          {/* Card Title Skeleton: Sign In */}
          <Skeleton className="h-6 w-24 mb-1 bg-gray-700" />
          {/* Card Description Skeleton */}
          <Skeleton className="h-4 w-52 bg-gray-700" />
        </CardHeader>

        <CardContent className="pt-6 grid gap-6">
          {/* Credential Field Skeleton */}
          <div className="grid gap-2">
            <Skeleton className="h-4 w-20 bg-gray-700" /> {/* Label */}
            <Skeleton className="h-10 w-full bg-gray-700" /> {/* Input */}
          </div>

          {/* Password Field Skeleton */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 bg-gray-700" /> {/* Label */}
              <Skeleton className="h-4 w-24 bg-gray-700" />{" "}
              {/* Forgot Password link */}
            </div>
            <Skeleton className="h-10 w-full bg-gray-700" /> {/* Input */}
          </div>

          {/* Sign In Button Skeleton */}
          <Skeleton className="h-10 w-full bg-gray-700" />
        </CardContent>
      </Card>
    </div>
  );
}
