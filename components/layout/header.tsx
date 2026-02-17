"use client";

import useLogout from "@/hooks/auth/useSignOut";
import { useAuthStore } from "@/stores/useAuthStore";
import { CircleUser, LogOut, MenuIcon } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "../common/modeToggle";
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
} from "../ui/alert-dialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useSidebar } from "../ui/sidebar";

function Header() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { me } = useAuthStore();
  const { handleLogout } = useLogout();

  return (
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
          {/* <Image src={logo} width={50} height={50} alt="darunnazat" /> */}
          <span className="hidden md:inline-block">DARUNNAZAT</span>
        </Link>
      </div>

      <div className="flex items-center gap-4 order-3">
        <ModeToggle />
        {/* Auth Section */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-9 w-9 rounded-full cursor-pointer">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {me?.profile.firstName
                  .split(" ")
                  .map((ch: string) => ch[0])
                  .join("")
                  .toUpperCase() || "DARUNNAZAT"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {me?.profile.firstName || "Darunnazat"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {me?.email || "info@darunnazat.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link className="flex items-center gap-2" href="/me">
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
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
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
  );
}

export default Header;
