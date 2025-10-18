import MainCards from "@/components/home/main-card-section";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store&apos;r;s performance and recent activities.
        </p>
      </div>

      {/* Stats Overview */}
      {/* <StatsCards /> */}

      {/* Main cards Overview */}
      <MainCards />
    </div>
  );
}
