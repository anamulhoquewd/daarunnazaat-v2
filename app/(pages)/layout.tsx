import type React from "react";

import { Suspense } from "react";

import Header from "@/components/layout/header";
import { AppSidebar } from "@/components/side-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <SidebarProvider className="flex" defaultOpen={defaultOpen}>
      <AppSidebar />

      <div className="flex-1 min-h-screen flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6">
            <Suspense>{children}</Suspense>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
