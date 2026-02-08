"use client";

import api from "@/axios/intercepter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMony } from "@/lib/utils";
import { Branch, IFeeCollection, monthlyFees } from "@/validations";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const statusConfig = {
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  partial: {
    label: "Partial",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  pending: {
    label: "Pending",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  overdue: {
    label: "Overdue",
    className: "bg-rose-50 text-rose-700 border border-rose-200",
  },
};

export default function InvoicePage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [fee, setFee] = useState<IFeeCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const invoiceRef = useRef(null);
  const handlePrint = () => {
    // Implement print functionality here
  };
  const handleDownloadPDF = () => {
    // Implement download PDF functionality here
  };

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchFee = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get(`/fees/${id}`);

        if (!response.data.success) {
          throw new Error(response.data.error.message);
        }

        setFee(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFee();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-sm border-neutral-200">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
                <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !fee) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-rose-200 bg-rose-50 shadow-sm">
            <CardContent className="p-8">
              <p className="text-rose-700 font-semibold">
                {error || "Invoice not found"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig_typed =
    statusConfig[fee.paymentStatus as keyof typeof statusConfig];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto">
        {/* Main Invoice Card */}
        <Card className="shadow-lg border-neutral-200 bg-white">
          <CardHeader className="border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-neutral-900 mb-2 uppercase">
                  {`Darun Nazat ${fee.branch === Branch.BRANCH_1 ? "Idial Girls " : ""}Madrasa`}
                </CardTitle>
                <p className="text-sm text-neutral-600 font-medium">
                  Kawlar, Jomidar Bari, Dokshin Khan, Dhaka - 1229 <br />
                  01712084833 | 01683124433
                </p>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-neutral-900 mb-2">
                  {fee.receiptNumber}
                </CardTitle>
                <p className="text-sm text-neutral-600 font-medium">
                  {format(
                    new Date(fee?.paymentDate ?? new Date()),
                    "dd MMMM yyyy",
                  )}
                </p>
              </div>
              <Badge className={statusConfig_typed?.className}>
                {statusConfig_typed?.label || fee.paymentStatus}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-8">
            {/* Student Information */}
            <div>
              <h3 className="text-base font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                Student Information
              </h3>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Student Name
                  </p>
                  <p className="font-semibold text-neutral-900">
                    {fee.studentId?.firstName ?? "Unknown"}{" "}
                    {fee.studentId?.lastName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Student ID
                  </p>
                  <p className="font-semibold text-neutral-900">
                    {fee.studentId?.studentId ?? "Unknown"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Branch
                  </p>
                  <p className="font-semibold text-neutral-900 capitalize">
                    {fee?.branch}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Gender
                  </p>
                  <p className="font-semibold text-neutral-900 capitalize">
                    {fee.studentId?.gender ?? "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-neutral-200" />

            {/* Session Information */}
            <div>
              <h3 className="text-base font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                Session Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Session Name
                  </p>
                  <p className="font-semibold text-neutral-900">
                    {fee.sessionId.sessionName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Session Status
                  </p>
                  <p className="font-semibold text-neutral-900">
                    {fee.sessionId.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-neutral-200" />

            {/* Fee Details */}
            <div>
              <h3 className="text-base font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                Fee Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-700">Fee Type</span>
                  <span className="font-medium text-neutral-900 capitalize">
                    {fee.feeType.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
                {monthlyFees.includes(fee.feeType) && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-neutral-700">Payment for</span>
                    <span className="font-medium text-neutral-900 capitalize">
                      {`${format(new Date(fee.year, fee.month, 1), "MMMM yyyy")}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-700">Base Amount</span>
                  <span className="font-medium text-neutral-900">
                    {formatMony(fee?.baseAmount ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-700">Payable Amount</span>
                  <span className="font-medium text-neutral-900">
                    {formatMony(fee?.payableAmount ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-neutral-200" />

            {/* Payment Summary */}
            <div>
              <h3 className="text-base font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                Payment Summary
              </h3>
              <div className="bg-neutral-50 p-6 rounded-lg space-y-4 border border-neutral-200">
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-700">Received Amount</span>
                  <span className="font-medium text-neutral-900">
                    {formatMony(fee.receivedAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-700">Due Amount</span>
                  <span className="font-medium text-neutral-900">
                    {formatMony(fee.dueAmount)}
                  </span>
                </div>
                {fee.advanceAmount > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-neutral-700">Advance Amount</span>
                    <span className="font-medium text-neutral-900 text-lg">
                      {formatMony(fee.advanceAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-neutral-200" />

            {/* Payment Information */}
            <div>
              <h3 className="text-base font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                Payment Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Payment Method
                  </p>
                  <p className="font-semibold text-neutral-900 capitalize">
                    {fee.paymentMethod}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Payment Source
                  </p>
                  <p className="font-semibold text-neutral-900 capitalize">
                    {fee.paymentSource}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Collected By
                  </p>
                  <p className="flex flex-col">
                    <span className="font-semibold text-neutral-900">
                      {fee.collectedBy.phone}
                    </span>
                    <span className="text-xs text-neutral-600">
                      {fee.collectedBy.role}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-neutral-200" />

            {fee.remarks && (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Remarks
                  </h3>
                  <p className="text-gray-700">{fee.remarks}</p>
                </div>
                <Separator className="bg-neutral-200" />
              </>
            )}

            {/* Footer Information */}
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
              <div>
                <p>Support</p>
                <p>
                  anamulhoquewd@gmail.com
                  <br />
                  01975024262
                </p>
              </div>
              <div>
                <p>Receipt Created</p>
                <p>{format(new Date(fee.createdAt), "cc LLL yyyy")}</p>
              </div>
              <div>
                <p>Last Updated</p>
                <p>{format(new Date(fee.updatedAt), "cc LLL yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
