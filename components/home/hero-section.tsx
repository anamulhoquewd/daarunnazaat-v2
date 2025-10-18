import React from "react";
import { Users, GraduationCap, School, DollarSign } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StatsCards = () => {
  const stats = [
    {
      label: "Total Students",
      value: "245",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "Total Teachers",
      value: "18",
      icon: GraduationCap,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      label: "Total Classes",
      value: "12",
      icon: School,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
    {
      label: "Fees This Month",
      value: "125,000",
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <Card
          key={index + stat.label}
          className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden p-6 border border-gray-100"
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
            <CardDescription className="text-sm font-medium mb-1">
              {stat.label}
            </CardDescription>
            <CardTitle className="text-foreground text-3xl font-bold">
              {stat.value}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
