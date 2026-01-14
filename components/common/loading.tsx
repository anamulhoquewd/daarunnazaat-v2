import Image from "next/image";
const logo = "/logo.jpg";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center w-16 h-16">
          <Image src={logo} alt="LOGO" width={500} height={500} />
        </div>

        {/* Loading Spinner */}
        <div className="flex gap-2">
          <div
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-sm text-muted-foreground mt-4">Loading...</p>
      </div>
    </div>
  );
}
