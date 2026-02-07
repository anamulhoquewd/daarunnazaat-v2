import { Card, CardContent } from "@/components/ui/card";

export function FeeUpdateSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-3">
          <div className="h-9 bg-neutral-200 dark:bg-neutral-700 rounded w-64 animate-pulse"></div>
          <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-96 animate-pulse"></div>
        </div>

        {/* Fee Info Card Skeleton */}
        <Card className="shadow-sm border-neutral-200">
          <CardContent className="p-6 space-y-6">
            {/* Card Header */}
            <div className="space-y-2">
              <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-72 animate-pulse"></div>
            </div>

            {/* Grid Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-32 animate-pulse"></div>
                  <div className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Card Skeleton */}
        <Card className="shadow-sm border-neutral-200">
          <CardContent className="p-6 space-y-6">
            {/* Card Header */}
            <div className="space-y-2">
              <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-40 animate-pulse"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-64 animate-pulse"></div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 pt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-36 animate-pulse"></div>
                  <div className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons Skeleton */}
        <div className="flex gap-4 pt-4">
          <div className="flex-1 h-10 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
          <div className="flex-1 h-10 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
