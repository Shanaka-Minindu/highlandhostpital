// components/organisms/navbar/signin-avatar.tsx
import React from "react";
import InteractiveSignInButton from "./interactive-sign-in-button";
import { auth } from "@/auth";
import UserDropdown from "./user-dropdown";


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
      email={email}
      image={image}
      name={userName}
      role={role}
      firstLetter={firstLetter}
    />
  );
};

export default SigninAvatar;
