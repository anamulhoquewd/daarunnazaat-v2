"use client";

import { SalaryPaymentForm } from "@/components/salaries/salaryPaymentForm";
import { StaffSearchToSalary } from "@/components/salaries/staffSearch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSalaryCenter } from "@/hooks/salaries/useSalaryCenter";
import { ArrowLeft, CircleDollarSign } from "lucide-react";
import Link from "next/link";

export default function SalaryCenterPage() {
  const salary = useSalaryCenter();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/salaries">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CircleDollarSign className="h-6 w-6 text-muted-foreground" />
            Salary Center
          </h1>
          <p className="text-sm text-muted-foreground">Search a staff member and process their salary payment</p>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StaffSearchToSalary
            staffs={salary.staffs}
            loading={salary.searchLoading}
            onSearch={salary.searchStaffs}
            onSelect={salary.selectStaff}
            selectedStaff={salary.selectedStaff}
          />
        </div>
        <div className="lg:col-span-2">
          <SalaryPaymentForm
            form={salary.form}
            selectedStaff={salary.selectedStaff}
            loading={salary.submitLoading}
            onSubmit={salary.submitSalary}
          />
        </div>
      </div>
    </div>
  );
}
