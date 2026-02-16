"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { EllipsisVertical, Home, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import MobileUserSigninOrAvatar from "./mobile-user-signinoravatar";

interface MenuClientProps {
  menuAvatar: ReactNode;
}

const MenuClient = ({ menuAvatar }: MenuClientProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handelSheetCloseAutoFocus = (event: Event) => {
    event.preventDefault();
  };
  return (
    <div>
      {/* Desktop view and tablet view */}
      <div className="hidden md:flex items-center justify-end w-full">
        <nav className="flex items-center gap-6">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link
              href="/"
              className="body-regular text-text-body hover:text-primary flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="brand" asChild size="lg">
              <Link href="/" className="text-text-caption-2">
                Book Appointment
              </Link>
            </Button>
            {menuAvatar}
          </div>
        </nav>
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex items-center justify-end">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger
            className="align-middle"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent
            side="right"
            onCloseAutoFocus={handelSheetCloseAutoFocus}
            className=" flex flex-col justify-between p-4 to-background-2"
          >
            <div className="flex flex-col gap-6">
              <SheetHeader className="text-left border-b pb-4">
                <SheetTitle className="text-2xl font-bold">Menu</SheetTitle>
              </SheetHeader>

              {/* Theme Toggle in Mobile */}
              <div className="px-2">
                <ThemeToggle />
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  onClick={() => closeMobileMenu}
                  className="flex items-center gap-2 px-2 text-lg font-medium hover:text-primary transition-colors"
                >
                  Home
                </Link>

                <Button
                  variant="brand"
                  asChild
                  size="sm"
                  className="text-text-caption-2"
                  onClick={() => closeMobileMenu}
                >
                  <Link href="/">Book Appointment</Link>
                </Button>
              </nav>
            </div>

            {/* Sign In / Avatar at the Bottom (as seen in screenshot) */}
            
              <SheetFooter className="w-full">
            <MobileUserSigninOrAvatar onMobileActionComplete={closeMobileMenu}/>
          </SheetFooter>
            
          </SheetContent>
          
        </Sheet>
      </div>
    </div>
  );
};

export default MenuClient;
