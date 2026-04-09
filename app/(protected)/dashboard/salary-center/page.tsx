"use client";

import { SalaryPaymentForm } from "@/components/salaries/salaryPaymentForm";
import { StaffSearchToSalary } from "@/components/salaries/staffSearch";
import { Button } from "@/components/ui/button";
import { useSalaryCenter } from "@/hooks/salaries/useSalaryCenter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SalaryCenterPage() {
  const salary = useSalaryCenter();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/salaries">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Salary Receive Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Record and manage staff salary payments
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Search */}
          <div className="lg:col-span-1">
            <StaffSearchToSalary
              staffs={salary.staffs}
              loading={salary.searchLoading}
              onSearch={salary.searchStaffs}
              onSelect={salary.selectStaff}
              selectedStaff={salary.selectedStaff}
            />
          </div>

          {/* Right Column - Payment Form */}
          <div className="lg:col-span-2">
            <SalaryPaymentForm
              form={salary.form}
              selectedStaff={salary.selectedStaff}
              loading={salary.submitLoading}
              onSubmit={salary.submitSalary}
            />
            ;
          </div>
        </div>
      </div>
    </main>
  );
}
