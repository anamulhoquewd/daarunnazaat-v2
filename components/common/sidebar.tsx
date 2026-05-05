"use client";

import {
  ArrowRightLeft,
  AudioWaveform,
  BadgeDollarSign,
  BanknoteArrowDown,
  BookAudio,
  BookOpen,
  BriefcaseBusiness,
  CirclePercent,
  ClipboardList,
  GalleryVerticalEnd,
  School2,
  ShieldCheck,
  ShieldPlus,
  Users,
  Wallet,
} from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/validations";
import { TeamSwitcher } from "./branchSwitcher";
import { NavMain } from "./navMenu";

const teams = [
  { name: "Main", logo: GalleryVerticalEnd, plan: "Enterprise" },
  { name: "Gulshan.", logo: AudioWaveform, plan: "Startup" },
];

const adminNavItems = [
  {
    title: "Students",
    url: "/dashboard/students",
    icon: BookAudio,
    items: [{ title: "Registration", url: "/dashboard/students/new" }],
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
    items: [{ title: "Registration", url: "/dashboard/users/new" }],
  },
  {
    title: "Staffs",
    url: "/dashboard/staffs",
    icon: BriefcaseBusiness,
    items: [{ title: "Registration", url: "/dashboard/staffs/new" }],
  },
  {
    title: "Guardians",
    url: "/dashboard/guardians",
    icon: ShieldCheck,
    items: [{ title: "Registration", url: "/dashboard/guardians/new" }],
  },
  {
    title: "Invoices",
    url: "/dashboard/invoices",
    icon: BadgeDollarSign,
    items: [],
  },
  {
    title: "Salaries",
    url: "/dashboard/salaries",
    icon: CirclePercent,
    items: [{ title: "Salary Center", url: "/dashboard/salary-center" }],
  },
  {
    title: "Expenses",
    url: "/dashboard/expenses",
    icon: CirclePercent,
    items: [{ title: "Create", url: "/dashboard/expenses/new" }],
  },
  {
    title: "Classes",
    url: "/dashboard/classes",
    icon: School2,
    items: [],
  },
  {
    title: "Sessions",
    url: "/dashboard/sessions",
    icon: ShieldPlus,
    items: [],
  },
  {
    title: "Transactions",
    url: "/dashboard/transactions",
    icon: ArrowRightLeft,
    items: [],
  },
  {
    title: "Pay Admission Due",
    url: "/dashboard/pay-admission-due",
    icon: BanknoteArrowDown,
    items: [],
  },
  {
    title: "Exams",
    url: "/dashboard/exams",
    icon: ClipboardList,
    items: [
      { title: "Create Exam", url: "/dashboard/exams/new" },
      { title: "Subjects", url: "/dashboard/exams/subjects" },
    ],
  },
  {
    title: "Salary (v5)",
    url: "/dashboard/salary-v5",
    icon: BadgeDollarSign,
    items: [],
  },
  {
    title: "Promotions",
    url: "/dashboard/promotions",
    icon: BookAudio,
    items: [],
  },
  {
    title: "Reports",
    url: "/dashboard/reports/income-expense",
    icon: Wallet,
    items: [
      { title: "Income vs Expense", url: "/dashboard/reports/income-expense" },
      { title: "Daily Collection", url: "/dashboard/reports/daily-collection" },
      { title: "Fee Status", url: "/dashboard/reports/fee-status" },
      { title: "Outstanding", url: "/dashboard/reports/outstanding" },
    ],
  },
];

const guardianNavItems = [
  {
    title: "My Students",
    url: "/dashboard/my-students",
    icon: BookOpen,
    items: [],
  },
  {
    title: "Invoices",
    url: "/dashboard/my-students/invoices",
    icon: BadgeDollarSign,
    items: [],
  },
  {
    title: "Payments",
    url: "/dashboard/my-students/payments",
    icon: Wallet,
    items: [],
  },
  {
    title: "Exam Results",
    url: "/dashboard/my-students",
    icon: ClipboardList,
    items: [],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile } = useSidebar();
  const { me } = useAuthStore();

  const roles = me?.user?.roles ?? [];
  const isGuardian = roles.includes(UserRole.GUARDIAN);
  const isAdmin =
    roles.includes(UserRole.ADMIN) ||
    roles.includes(UserRole.SUPER_ADMIN) ||
    roles.includes(UserRole.STAFF);

  const navItems = [
    ...(isAdmin ? adminNavItems : []),
    ...(isGuardian ? guardianNavItems : []),
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      {!isMobile && (
        <SidebarFooter>
          <SidebarTrigger className="ml-auto cursor-pointer" />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
