import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function StudentNotFound() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-24">
      <div className="font-cormorant max-w-md text-center space-y-6">
        {/* Icon: 404 representation */}
        <div className="flex justify-center">
          <div className="text-6xl text-muted-foreground/40">404</div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl text-foreground">
            Student Not Found
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            The student you&apos;re looking for has been removed or the link may
            be incorrect. Please explore our collection or create a custom
            order.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard/students">
            <Button
              size={"lg"}
              className="cursor-pointer text-xs tracking-[0.2em] uppercase"
            >
              Explore Students
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant={"outline"}
              size={"lg"}
              className="cursor-pointer text-xs tracking-[0.2em] uppercase"
            >
              Dashboard Home
            </Button>
          </Link>
        </div>

        {/* Decorative line */}
        <Separator className="h-0.5" />

        {/* Help text */}
        <p className="text-sm text-muted-foreground">
          Need assistance? Contact our{" "}
          <Link href={"/support"}>
            <span className="text-primary tracking-wide underline uppercase">
              support
            </span>
          </Link>{" "}
          team
        </p>
      </div>
    </div>
  );
}
