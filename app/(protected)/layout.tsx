import type React from "react";
import { AuthGate } from "@/components/auth/authGet";
import { AppSidebar } from "@/components/common/sidebar";
import Header from "@/components/layout/header";
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
    <AuthGate>
      <SidebarProvider defaultOpen={defaultOpen} className="flex">
        <AppSidebar />

        <div className="flex-1 min-h-screen flex-col">
          {/* Top Navigation */}
          <Header />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </AuthGate>
  );
}
