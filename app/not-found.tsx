import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-2">
          <p className="text-8xl font-bold text-muted-foreground/20 select-none tabular-nums">
            404
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Go back
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-1.5" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
