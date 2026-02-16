import React from "react";
import Link from "next/link";
import { SquarePlus, Sun } from "lucide-react";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import MenuClient from "../molecules/menu-client";
import SigninAvatar from "../molecules/signin-avatar";
const Header: React.FC = () => {
  return (
    <header className="w-full bg-background-2  top-0 z-50 py-3 ">
      {/* Left Section: Logo */}
      <div className="flex items-center justify-between max-w-[1440px] h-[65px]  px-6 md:px- mx-auto">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/images/Logo.svg" alt={APP_NAME} width={32} priority={true} height={32}/>
        <h3 className="hidden lg:block">
          {APP_NAME}
        </h3>
      </Link>

      {/* Right Section: Navigation & Actions */}
      <MenuClient menuAvatar={<SigninAvatar/>}/>
      </div>
    </header>
  );
};

export default Header;
