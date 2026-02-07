import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { formatMony, MONTHS } from "@/lib/utils";
import { IFeeCollection } from "@/validations";

interface FeeInfoCardProps {
  fee: IFeeCollection;
}

export function FeeInfoCard({ fee }: FeeInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fee Record Information</CardTitle>
        <CardDescription>
          These fields are locked and cannot be modified
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReadOnlyField label="Receipt Number" value={fee.receiptNumber} />
          <ReadOnlyField
            label="Student Name"
            value={`${fee.studentId?.firstName} ${fee.studentId?.lastName}`}
          />
          <ReadOnlyField label="Student ID" value={fee.studentId?._id} />
          <ReadOnlyField label="Fee Type" value={fee.feeType} />
          <ReadOnlyField
            label="Payable Amount"
            value={`PKR ${formatMony(fee?.payableAmount)}`}
          />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold">Payment Status</Label>
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="px-3 py-2 rounded-md bg-emerald-50 text-emerald-700 text-sm font-medium inline-block border border-emerald-200">
              {fee.paymentStatus}
            </div>
          </div>
          <ReadOnlyField label="Branch" value={fee.branch} />
          <ReadOnlyField
            label="Billing Period (Current)"
            value={`${typeof fee.month === "number" ? MONTHS[fee.month] : fee.month} ${fee.year}`}
          />
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
