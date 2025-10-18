"use client";

import type React from "react";

import Link from "next/link";
import { CircleUser, LogOut, MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { Suspense } from "react";

import { AppSidebar } from "@/components/side-bar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import useMe from "@/hooks/auth/use-me";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="flex">
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { user, handleLogout } = useMe();

  return (
    <>
      <AppSidebar />

      <div className="flex-1 min-h-screen flex-col">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
          {/* Mobile Navigation */}
          {isMobile && (
            <Button
              onClick={() => setOpenMobile(true)}
              variant="ghost"
              size="icon"
              className="order-1"
            >
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}

          <div className="flex items-center gap-2 order-2 md:order-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold md:flex"
            >
              {/* <Image src={logo} width={50} height={50} alt="TASFIN" /> */}
              <span className="hidden md:inline-block">TASFIN</span>
            </Link>
          </div>

          <div className="flex items-center gap-4 order-3">
            <ModeToggle />
            {/* Auth Section */}
            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 w-9 rounded-full cursor-pointer">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {user?.name
                      .split(" ")
                      .map((ch) => ch[0])
                      .join("")
                      .toUpperCase() || "TASFIN"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "Shuddhoghor"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "info@shuddhoghor.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link className="flex items-center gap-2" href="/teachers/me">
                    <DropdownMenuItem className="cursor-pointer w-full">
                      <CircleUser className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger
                    className="p-0 border-none w-full cursor-pointer flex justify-start"
                    asChild
                  >
                    <Button variant="outline">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogout}
                        className="cursor-pointer"
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6">
            <Suspense>{children}</Suspense>
          </div>
        </main>
      </div>
    </>
  );
}
