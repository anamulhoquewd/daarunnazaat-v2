import { RecentActivity } from "@/components/dashboard/recentActivity";
import { StatsCard } from "@/components/dashboard/stateCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, DollarSign, Calendar } from "lucide-react";

function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your educational management system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Students"
          value="1,234"
          description="+8%"
          icon={Users}
          plaintext={true}
        />
        <StatsCard
          title="Fees Collected"
          value="₹45,000"
          description="+8%"
          icon={DollarSign}
        />
        <StatsCard
          title="Attendance Rate"
          value="92%"
          description="+8%"
          icon={Calendar}
        />
        <StatsCard
          title="Active Classes"
          value="24"
          description="+8%"
          icon={BarChart3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-muted rounded flex items-center justify-center">
              Chart placeholder (implement with Recharts)
            </div>
          </CardContent>
        </Card>

        <RecentActivity />
      </div>
    </div>
  );
}

export default Dashboard;
