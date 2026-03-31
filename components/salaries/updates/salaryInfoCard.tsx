import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatMony } from "@/lib/utils";
import { ISalaryPayment } from "@/validations";
import { Lock } from "lucide-react";

interface SalaryInfoCardProps {
  salary: ISalaryPayment;
}

export function SalaryInfoCard({ salary }: SalaryInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Salary Record Information</CardTitle>
        <CardDescription>
          These fields are locked and cannot be modified
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReadOnlyField label="Receipt Number" value={salary.receiptNumber} />
          <ReadOnlyField
            label="Staff Name"
            value={`${salary.staffId?.fullName}`}
          />
          <ReadOnlyField label="Staff ID" value={salary.staffId?._id} />
          <ReadOnlyField
            label="Salary Amount"
            value={`BDT ${formatMony(salary?.staffId?.baseSalary || 0)}`}
          />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold">Payment Status</Label>
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="px-3 py-2 rounded-md bg-emerald-50 text-emerald-700 text-sm font-medium inline-block border border-emerald-200">
              {salary.status}
            </div>
          </div>
          <ReadOnlyField label="Branch" value={salary.branch} />
          <ReadOnlyField label="Billing Period (Current)" value={salary.period} />
        </div>
      </CardContent>
    </Card>
  );
}

interface ReadOnlyFieldProps {
  label: string;
  value: string | undefined;
}

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-semibold">{label}</Label>
        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-sm">
        {value}
      </div>
    </div>
  );
}
