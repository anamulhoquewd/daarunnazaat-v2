"use client";

import { FeePaymentForm } from "@/components/feeCenter/feePaymentForm";
import { FeeStudentSearch } from "@/components/feeCenter/studentSearch";
import { Button } from "@/components/ui/button";
import { useFeeReceiveCenter } from "@/hooks/fees/useFee";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FeeReceiveCenterPage() {
  const fee = useFeeReceiveCenter();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/fees">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Fee Receive Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Record and manage student fee payments
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Search */}
          <div className="lg:col-span-1">
            <FeeStudentSearch
              students={fee.students}
              loading={fee.searchLoading}
              onSearch={fee.searchStudents}
              onSelect={fee.selectStudent}
              selectedStudent={fee.selectedStudent}
            />
          </div>

          {/* Right Column - Payment Form */}
          <div className="lg:col-span-2">
            <FeePaymentForm
              form={fee.form}
              selectedStudent={fee.selectedStudent}
              loading={fee.submitLoading}
              onSubmit={fee.submitFee}
            />
            ;
          </div>
        </div>
      </div>
    </main>
  );
}
