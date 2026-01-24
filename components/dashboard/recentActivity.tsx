import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  {
    id: 1,
    type: "student",
    message: "New student enrolled",
    time: "2 hours ago",
  },
  { id: 2, type: "fee", message: "Fee payment received", time: "4 hours ago" },
  {
    id: 3,
    type: "attendance",
    message: "Attendance marked",
    time: "6 hours ago",
  },
];

export const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between pb-4 border-b last:pb-0 last:border-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.time}
                </p>
              </div>
              <Badge variant="outline">{activity.type}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
