// components/organisms/navbar/user-dropdown.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { signOutUser } from "@/lib/actions/user.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, LayoutDashboard } from "lucide-react";

interface UserDropdownProps {
  email?: string | null;
  image?: string | null;
  name: string;
  role?: string;
  firstLetter: string;
}

const UserDropdown = ({
  email,
  image,
  name,
  role,
  firstLetter,
}: UserDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-10 w-10 border border-border cursor-pointer hover:opacity-80 transition">
          {image ? (
            <div className="relative h-full w-full">
              <Image src={image} alt={name} fill className="object-cover" />
            </div>
          ) : (
            <AvatarFallback className="bg-slate-700 text-primary-foreground font-bold">
              {firstLetter}
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 border-0 flex flex-col gap-1"  align="end" forceMount>
        {/* Row 1: User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Row 2: Role-based Navigation */}
        {role === "PATIENT" && (
          <DropdownMenuItem asChild>
            <Link
              href="/user/profile"
              className="cursor-pointer flex items-center"
            >
              <User className="mr-2 h-4 w-4" />
              <span>User Profile</span>
            </Link>
          </DropdownMenuItem>
        )}

        {role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link
              href="/admin/dashboard"
              className="cursor-pointer flex items-center"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Row 3: Sign Out */}
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer mb-2"
          onClick={async () => await signOutUser()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
