"use client";

import api from "@/axios/intercepter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMony } from "@/lib/utils";
import {
  Branch,
  ISalaryPayment
} from "@/validations";
import { format, parse } from "date-fns";
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
};

export default function InvoicePage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [salary, setSalary] = useState<ISalaryPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (invoiceRef.current && typeof window !== "undefined") {
      const printContents = invoiceRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
    }
  };

  const handleDownloadPDF = () => {
    // Implement download PDF functionality here
  };

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchSalary = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get(`/salaries/${id}`);

        if (!response.data.success) {
          throw new Error(response.data.error.message);
        }

        setSalary(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalary();
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

  if (error || !salary) {
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

  const date = parse(salary?.period, "yyyy-MM", new Date());
  const formatted = format(date, "MMMM yyyy");

  const statusConfig_typed =
    statusConfig[salary.status as keyof typeof statusConfig];

  return (
    <div className="min-h-screen bg-white">
      <div className="flex justify-end space-x-4 mb-4 print:hidden">
        <Button
          onClick={handlePrint}
          className="cursor-pointer bg-green-600 hover:bg-green-700 text-white"
        >
          Print
        </Button>
      </div>
      <div className="mx-auto print:p-0 p-4 md:p-8">
        {/* Main Invoice Card */}
        <Card
          ref={invoiceRef}
          className="shadow-lg border-neutral-200 bg-white"
        >
          <CardHeader className="border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-neutral-900 mb-2 uppercase">
                  {`Darun Nazat ${salary.branch === Branch.BALIKA_BRANCH ? "Idial Girls " : ""}Madrasa`}
                </CardTitle>
                <p className="text-sm text-neutral-600 font-medium">
                  Kawlar, Jomidar Bari, Dokshin Khan, Dhaka - 1229 <br />
                  01712084833 | 01683124433
                </p>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-neutral-900 mb-2">
                  {salary.receiptNumber}
                </CardTitle>
                <p className="text-sm text-neutral-600 font-medium">
                  {format(
                    new Date(salary?.paymentDate ?? new Date()),
                    "dd LLL yyyy",
                  )}
                </p>
              </div>
              <Badge className={statusConfig_typed?.className}>
                {statusConfig_typed?.label || salary.status}
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
                    {salary.staffId?.fullName ?? "Unknown"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Student ID
                  </p>
                  <p className="font-semibold text-neutral-900">
                    {salary.staffId?.staffId ?? "Unknown"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Branch
                  </p>
                  <p className="font-semibold text-neutral-900 capitalize">
                    {salary?.branch}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Gender
                  </p>
                  <p className="font-semibold text-neutral-900 capitalize">
                    {salary.staffId?.gender ?? "Unknown"}
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
                    <span className="text-neutral-700">Payment for</span>
                    <span className="font-medium text-neutral-900 capitalize">
                      {formatted}
                    </span>
                  </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-700">Base Amount</span>
                  <span className="font-medium text-neutral-900">
                    {formatMony(salary?.baseSalary ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-700">Payable Amount</span>
                  <span className="font-medium text-neutral-900">
                    {formatMony(salary?.staffId?.baseSalary ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-700">Bonus Amount</span>
                  <span className="font-medium text-neutral-900">
                    {formatMony(salary?.bonus ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-700">Net Amount</span>
                  <span className="font-medium text-neutral-900">
                    {formatMony(salary?.netSalary ?? 0)}
                  </span>
                </div>
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
                    {salary.paymentMethod}
                  </p>
                </div>
               
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Collected By
                  </p>
                  <p className="flex flex-col">
                    <span className="font-semibold text-neutral-900">
                      {salary.paidBy.phone}
                    </span>
                    <span className="text-xs text-neutral-600">
                      {salary.paidBy?.roles[0] || "-"}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">
                    Signature
                  </p>
                  <div className="h-12 w-32 border-b border-neutral-900"></div>
                </div>
              </div>
            </div>

            <Separator className="bg-neutral-200" />

            {salary.remarks && (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Remarks
                  </h3>
                  <p className="text-gray-700">{salary.remarks}</p>
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
                <p>
                  {format(new Date(salary.createdAt ?? new Date()), "dd LLL yyyy")}
                </p>
              </div>
              <div>
                <p>Last Updated</p>
                <p>
                  {format(new Date(salary.updatedAt ?? new Date()), "dd LLL yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
