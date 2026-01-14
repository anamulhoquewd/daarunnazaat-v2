import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      {/* Container with max width for premium spacing */}
      <div className="font-cormorant w-full max-w-2xl mx-auto text-center">
        {/* 404 Number - Large elegant display */}
        <div className="mb-8">
          <p className="text-[120px] md:text-[160px] font-light leading-none text-muted-foreground/30">
            404
          </p>
        </div>

        {/* Main heading */}
        <h1 className="text-3xl md:text-4xl font-light text-foreground mb-4 tracking-wide">
          Page Not Found
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground mb-12 font-light leading-relaxed max-w-md mx-auto">
          The page you are looking for does not exist or has been removed. Let
          us help you get back on track.
        </p>

        {/* Action buttons */}
        <Link href="/">
          <Button
            size={"lg"}
            className="rounded-none cursor-pointer text-xs tracking-[0.2em] uppercase"
          >
            <span className="flex items-center gap-2">
              Back to Home
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
