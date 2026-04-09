"use client";

import { DuePaymentForm } from "@/components/due-admission-payment/form";
import { FeeStudentSearch } from "@/components/feeCenter/studentSearch";
import { Button } from "@/components/ui/button";
import { useDuePayCenter } from "@/hooks/pay-admission-due/usePayAdmissionDue";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FeeReceiveCenterPage() {
  const payment = useDuePayCenter();

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
              Due Payment Center
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
              students={payment.students}
              loading={payment.searchLoading}
              onSearch={payment.searchStudents}
              onSelect={payment.selectStudent}
              selectedStudent={payment.selectedStudent}
            />
          </div>

          {/* Right Column - Payment Form */}
          <div className="lg:col-span-2">
            <DuePaymentForm
              form={payment.form}
              selectedStudent={payment.selectedStudent}
              loading={payment.submitLoading}
              onSubmit={payment.submitFee}
            />
            ;
          </div>
        </div>
      </div>
    </main>
  );
}
