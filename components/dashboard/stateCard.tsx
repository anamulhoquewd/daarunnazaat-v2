import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantStyles: Record<string, string> = {
  default: "border-l-slate-400",
  success: "border-l-emerald-500",
  warning: "border-l-amber-500",
  danger: "border-l-red-500",
  info: "border-l-blue-500",
};

function StatCard({
  label,
  value,
  sub,
  icon,
  variant = "default",
}: StatCardProps) {
  return (
    <Card className={`border-l-4 ${variantStyles[variant]} shadow-sm`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {sub ? (
              <p className="text-xs text-muted-foreground">{sub}</p>
            ) : null}
          </div>
          <div className="rounded-xl bg-muted/60 p-2.5">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
