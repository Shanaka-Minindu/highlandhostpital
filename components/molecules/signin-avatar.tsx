// components/organisms/navbar/signin-avatar.tsx
import React from "react";
import InteractiveSignInButton from "./interactive-sign-in-button";
import { auth } from "@/auth";
import UserDropdown from "./user-dropdown";
import { useSession } from "next-auth/react"

const SigninAvatar = async () => {
  const session = await auth();



  if (!session?.user) {
    return <InteractiveSignInButton />;
  }

  const { email, image, name, role } = session.user;
  const userName = name ?? "User";
  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <UserDropdown
    key={session.user.id}
      email={email}
      image={image}
      name={userName}
      role={role}
      firstLetter={firstLetter}
    />
  );
};

export default SigninAvatar;
