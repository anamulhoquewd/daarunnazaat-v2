"use client";

import { School, GraduationCap, Users, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import usePayments from "@/hooks/payments/use-payments";
import useClasses from "@/hooks/classes/use-classes";
import useAdmins from "@/hooks/admins/use-admins";
import useStudents from "@/hooks/students/use-students";
import Link from "next/link";

function MainCards() {
  const { payments } = usePayments();
  const { classes } = useClasses();
  const { admins } = useAdmins();
  const { students } = useStudents();

  const mainCards = [
    {
      title: "Teachers",
      description: "Manage teacher information",
      icon: GraduationCap,
      count: admins.length + " Teachers",
      href: "/teachers",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      title: "Classes",
      description: "Organize classes and schedules",
      icon: School,
      count: classes.length + " Classes",
      href: "/classes",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
    {
      title: "Students",
      description: "Track student records and progress",
      icon: Users,
      count: students.length + " Students",
      href: "/students",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Payments",
      description: "Monitor fee collection and reports",
      icon: Wallet,
      count: payments.length + " transition on This Month",
      href: "/payments",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
  ];

  return (
    <section className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6`}>
      {mainCards.map((card, index) => (
        <Card
          key={index + card.title}
          className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <CardHeader>
            <div
              className={`h-12 w-12 rounded-xl ${card.bgColor} p-3 rounded-xl`}
            >
              <card.icon className={`w-6 h-6 ${card.textColor}`} />
            </div>
            <CardTitle className="text-xl text-foreground">
              {card.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {card.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">
                {card.count}
              </span>
              <Link href={card.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                >
                  Manage →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export default MainCards;
