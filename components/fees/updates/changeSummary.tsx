import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Changes {
  receivedAmount?: { old: number; new: number };
  period?: { old: string; new: string };
}

interface ChangesSummaryProps {
  changes: Changes;
}

export function ChangesSummary({ changes }: ChangesSummaryProps) {
  const hasChanges = Object.keys(changes).length > 0;

  if (!hasChanges) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            Summary of Changes
          </h3>
          <ul className="space-y-2 text-sm">
            {changes.receivedAmount && (
              <li className="flex justify-between">
                <span>Received Amount:</span>
                <span>
                  BDT {changes.receivedAmount.old.toLocaleString()} → BDT{" "}
                  {changes.receivedAmount.new.toLocaleString()}
                </span>
              </li>
            )}

            {changes.period && (
              <li className="flex justify-between">
                <span>Billing Period:</span>
                <span>
                  {changes.period.old} → {changes.period.new}
                </span>
              </li>
            )}
          </ul>
          <Separator />
          <div className="pt-3">
            <p className="text-xs">
              These changes will update student balance and reports.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
