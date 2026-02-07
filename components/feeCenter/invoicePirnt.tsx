"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { IFeeCollection } from "@/validations";
import api from "@/axios/intercepter";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getMonthName(month: number): string {
  return monthNames[month - 1] || "Unknown";
}

const statusConfig = {
  paid: { label: "Paid", className: "bg-green-100 text-green-800" },
  partial: { label: "Partial", className: "bg-yellow-100 text-yellow-800" },
  pending: { label: "Pending", className: "bg-blue-100 text-blue-800" },
  overdue: { label: "Overdue", className: "bg-red-100 text-red-800" },
};

export default function InvoicePage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [data, setData] = useState<IFeeCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        setData(response.data.data);
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
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !fee) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <Card className="max-w-4xl mx-auto border-red-200 bg-red-50">
          <CardContent className="p-8">
            <p className="text-red-600 font-semibold">
              {error || "Invoice not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig_typed =
    statusConfig[fee.paymentStatus as keyof typeof statusConfig];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Main Invoice Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {fee.receiptNumber}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {`${getMonthName(fee.month)} ${fee.year}`}
                </p>
              </div>
              <Badge className={statusConfig_typed?.className}>
                {statusConfig_typed?.label || fee.paymentStatus}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Student Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Student Information
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">Student Name</p>
                  <p className="font-medium text-gray-900">
                    {fee.studentId.firstName} {fee.studentId.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Student ID</p>
                  <p className="font-medium text-gray-900">
                    {fee.studentId.studentId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Branch</p>
                  <p className="font-medium text-gray-900">
                    {fee.studentId.branch}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {fee.studentId.gender}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Session Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Session Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Session Name</p>
                  <p className="font-medium text-gray-900">
                    {fee.sessionId.sessionName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Session Status</p>
                  <p className="font-medium text-gray-900">
                    {fee.sessionId.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Fee Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Fee Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fee Type</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {fee.feeType.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Amount</span>
                  <span className="font-medium text-gray-900">
                    ৳ {fee.baseAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payable Amount</span>
                  <span className="font-medium text-gray-900">
                    ৳ {fee.payableAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Summary
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Received Amount</span>
                  <span className="font-semibold text-green-600">
                    ৳ {fee.receivedAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Due Amount</span>
                  <span className="font-semibold text-red-600">
                    ৳ {fee.dueAmount.toLocaleString()}
                  </span>
                </div>
                {fee.advanceAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Advance Amount</span>
                    <span className="font-semibold text-blue-600">
                      ৳ {fee.advanceAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {fee.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Source</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {fee.paymentSource}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Collected By</p>
                  <p className="font-medium text-gray-900">
                    {fee.collectedBy.phone}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Footer Information */}
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <p>Receipt Created</p>
                <p>{format(new Date(fee.createdAt), "PPp")}</p>
              </div>
              <div>
                <p>Last Updated</p>
                <p>{format(new Date(fee.updatedAt), "PPp")}</p>
              </div>
            </div>

            {fee.remarks && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Remarks
                  </h3>
                  <p className="text-gray-700">{fee.remarks}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
