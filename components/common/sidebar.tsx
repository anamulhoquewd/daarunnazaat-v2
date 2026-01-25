"use client";

import {
  AudioWaveform,
  GalleryVerticalEnd,
  SquareTerminal,
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
import { TeamSwitcher } from "./branchSwitcher";
import { NavMain } from "./navMenu";

// This is sample data.
const data = {
  teams: [
    {
      name: "Main",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Gulshan.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],

  navMain: [
    {
      title: "Students",
      url: "/dashboard/students",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Registration",
          url: "/dashboard/students/new",
        },
        {
          title: "Starred",
          url: null,
        },
        {
          title: "Settings",
          url: null,
        },
      ],
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: SquareTerminal,
      items: [
        {
          title: "Registration",
          url: "/dashboard/users/new",
        },
        {
          title: "Starred",
          url: null,
        },
        {
          title: "Settings",
          url: null,
        },
      ],
    },
    {
      title: "Staffs",
      url: "/dashboard/staffs",
      icon: SquareTerminal,
      items: [
        {
          title: "Registration",
          url: "/dashboard/staffs/new",
        },
        {
          title: "Starred",
          url: null,
        },
        {
          title: "Settings",
          url: null,
        },
      ],
    },
    {
      title: "Classes",
      url: "/dashboard/classes",
      icon: SquareTerminal,
      items: [
        {
          title: "Registration",
          url: null,
        },
        {
          title: "Starred",
          url: null,
        },
        {
          title: "Settings",
          url: null,
        },
      ],
    },
    {
      title: "Sessions",
      url: "/dashboard/sessions",
      icon: SquareTerminal,
      items: [
        {
          title: "Registration",
          url: null,
        },
        {
          title: "Starred",
          url: null,
        },
        {
          title: "Settings",
          url: null,
        },
      ],
    },
    {
      title: "Guardians",
      url: "/dashboard/guardians",
      icon: SquareTerminal,
      items: [
        {
          title: "Registration",
          url: null,
        },
        {
          title: "Starred",
          url: null,
        },
        {
          title: "Settings",
          url: null,
        },
      ],
    },
    {
      title: "Fees ",
      url: "/dashboard/fees ",
      icon: SquareTerminal,
      items: [
        {
          title: "Registration",
          url: null,
        },
        {
          title: "Starred",
          url: null,
        },
        {
          title: "Settings",
          url: null,
        },
      ],
    },
    {
      title: "Transactions ",
      url: "/dashboard/transactions ",
      icon: SquareTerminal,
      items: [
        {
          title: "Registration",
          url: null,
        },
        {
          title: "Starred",
          url: null,
        },
        {
          title: "Settings",
          url: null,
        },
      ],
    },
    {
      title: "Salaries ",
      url: "/dashboard/salaries ",
      icon: SquareTerminal,
      items: [
        {
          title: "Registration",
          url: null,
        },
        {
          title: "Starred",
          url: null,
        },
        {
          title: "Settings",
          url: null,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
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
