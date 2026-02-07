import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileX2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeeNotFoundProps {
  error?: string | null;
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export function FeeNotFound({
  error,
  title = "Fee Record Not Found",
  message = "The fee record you're looking for doesn't exist or may have been deleted.",
  showBackButton = true,
}: FeeNotFoundProps) {
  const router = useRouter();

  const isError = !!error;
  const displayTitle = error ? "Error Loading Fee Record" : title;
  const displayMessage = error || message;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 p-6">
      <div className="max-w-2xl mx-auto">
        <Card
          className={`shadow-lg ${
            isError
              ? "border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900"
              : "border-neutral-200 bg-white dark:bg-neutral-900"
          }`}
        >
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div
                className={`p-4 rounded-full ${
                  isError
                    ? "bg-rose-100 dark:bg-rose-900/30"
                    : "bg-neutral-100 dark:bg-neutral-800"
                }`}
              >
                {isError ? (
                  <AlertTriangle className="h-12 w-12 text-rose-600 dark:text-rose-400" />
                ) : (
                  <FileX2 className="h-12 w-12 text-neutral-600 dark:text-neutral-400" />
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1
                  className={`text-2xl font-bold ${
                    isError
                      ? "text-rose-900 dark:text-rose-100"
                      : "text-neutral-900 dark:text-neutral-100"
                  }`}
                >
                  {displayTitle}
                </h1>

                {/* Message */}
                <p
                  className={`text-base ${
                    isError
                      ? "text-rose-700 dark:text-rose-300"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {displayMessage}
                </p>
              </div>

              {/* Action Buttons */}
              {showBackButton && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                  </Button>
                  <Button onClick={() => router.push("/dashboard/fees")}>
                    View All Fees
                  </Button>
                </div>
              )}

              {/* Additional Help Text */}
              {!isError && (
                <p className="text-sm text-neutral-500 dark:text-neutral-500 pt-4">
                  If you believe this is an error, please contact support or
                  check the fee ID.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
