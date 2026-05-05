"use client";

import ExpenseTab from "@/components/dashboard/expense-tab";
import FeesTabe from "@/components/dashboard/fees-tab";
import FilterPanel from "@/components/dashboard/filter-panel";
import OverviewTab from "@/components/dashboard/overview-tab";
import SalaryTab from "@/components/dashboard/salary-tab";
import TransactionTab from "@/components/dashboard/transaction-tab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useDashboard from "@/hooks/dashboard/useDashboard";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const [showFilters, setShowFilters] = useState(false);
  const {
    dashboard,
    filters,
    setFilter,
    resetFilters,
    activeFilterCount,
    isLoading,
    refetch,
  } = useDashboard();

    const sessions = dashboard?.meta.sessions || [];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
              D
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">
                Dashboard Analytics
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Real-time financial overview from fees, expenses, and salaries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 ? (
                <Badge className="ml-2 h-5 min-w-5 px-1 text-[10px]">
                  {activeFilterCount}
                </Badge>
              ) : null}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl space-y-5 px-6 py-6">
        {showFilters ? (
          <FilterPanel
            filters={filters}
            setFilter={setFilter}
            resetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
            sessionOptions={sessions}
          />
        ) : null}

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full max-w-xl grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="salary">Salary</TabsTrigger>
          </TabsList>

          {/* overview */}
          <OverviewTab dashboard={dashboard} />

          {/* fees tab */}
          <FeesTabe dashboard={dashboard} />

          {/* expense tab */}
          <ExpenseTab dashboard={dashboard} />

          {/* transaction tab */}
          <TransactionTab dashboard={dashboard} />

          {/* salary tab */}
          <SalaryTab dashboard={dashboard} />
        </Tabs>

        {!dashboard && isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Loading dashboard data...
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
