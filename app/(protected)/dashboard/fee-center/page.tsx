"use client";

import { FeePaymentForm } from "@/components/feeCenter/feePaymentForm";
import { FeeStudentSearch } from "@/components/feeCenter/studentSearch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useFeeCenter } from "@/hooks/fees/useFeeCenter";
import { ArrowLeft, Banknote } from "lucide-react";
import Link from "next/link";

export default function FeeReceiveCenterPage() {
  const fee = useFeeCenter();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/fees">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Banknote className="h-6 w-6 text-muted-foreground" />
            Fee Receive Center
          </h1>
          <p className="text-sm text-muted-foreground">Search a student and record their fee payment</p>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FeeStudentSearch
            students={fee.students}
            loading={fee.searchLoading}
            onSearch={fee.searchStudents}
            onSelect={fee.selectStudent}
            selectedStudent={fee.selectedStudent}
          />
        </div>
        <div className="lg:col-span-2">
          <FeePaymentForm
            form={fee.form}
            selectedStudent={fee.selectedStudent}
            loading={fee.submitLoading}
            onSubmit={fee.submitFee}
          />
        </div>
      </div>
    </div>
  );
}
