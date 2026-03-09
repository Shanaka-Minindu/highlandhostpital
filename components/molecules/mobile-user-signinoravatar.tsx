"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Session } from "next-auth";
import { signOutUser } from "@/lib/actions/user.actions";
import InteractiveSignInButton from "./interactive-sign-in-button";

// Shadcn UI Imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, LayoutDashboard } from "lucide-react";

interface MobileUserMenuProps {
  onMobileActionComplete?: () => void;
  session: Session | null;
}

const MobileUserSigninOrAvatar = ({
  onMobileActionComplete,
  session,
}: MobileUserMenuProps) => {
  // 1. Handle Unauthenticated State
  const [openD, setOpenD] = useState(false);
  if (!session?.user) {
    return (
      <InteractiveSignInButton onNavigationStart={onMobileActionComplete} />
    );
  }

  const { email, image, name, role } = session.user;
  const userName = name ?? "User";
  const firstLetter = userName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setOpenD(false);
    if (onMobileActionComplete) onMobileActionComplete();
    await signOutUser();
  };

  function changeDrawer() {
    setOpenD(!openD);
  }

  return (
    <Dialog open={openD} onOpenChange={changeDrawer}>
      {/* 2. Trigger Area: Circular Shape + User Name */}
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 justify-start pl-0"
        >
          <div className="h-10 w-10 relative rounded-full overflow-hidden">
            {image ? (
              <div className=" h-full w-full">
                <Image
                  src={image}
                  alt={userName}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {firstLetter}
              </AvatarFallback>
            )}
          </div>
          <span className="font-semibold text-text-title truncate">
            {userName}
          </span>
        </Button>
      </DialogTrigger>

      {/* 3. Dialog Content */}
      <DialogContent className="max-w-[90vw] rounded-xl sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center justify-center pt-4">
          <Avatar className="h-16 w-16 mb-2 border-2 border-primary/10">
            {image ? (
              <div className="relative h-full w-full">
                <Image
                  src={image}
                  alt={userName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <AvatarFallback className="text-xl font-bold">
                {firstLetter}
              </AvatarFallback>
            )}
          </Avatar>
          <DialogTitle className="text-center text-xl font-bold">
            {userName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{email}</p>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-6">
          {/* Role-based Navigation */}
          {role === "PATIENT" && (
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-3 py-6"
            >
              <Link href="/user/profile" onClick={onMobileActionComplete}>
                <User className="h-5 w-5" />
                Patient Profile
              </Link>
            </Button>
          )}

          {role === "ADMIN" && (
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-3 py-6"
            >
              <Link href="/admin/dashboard" onClick={onMobileActionComplete}>
                <LayoutDashboard className="h-5 w-5" />
                Admin Dashboard
              </Link>
            </Button>
          )}

          {/* Sign Out Button */}
          <Button
            variant="destructive"
            className="w-full justify-start gap-3 py-6 mt-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileUserSigninOrAvatar;
