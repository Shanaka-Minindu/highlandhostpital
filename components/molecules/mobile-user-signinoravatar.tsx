"use client";
import InteractiveSignInButton from "./interactive-sign-in-button";

interface MobileUserMenuProps {
  onMobileActionComplete?: () => void;
}

const MobileUserSigninOrAvatar = ({
  onMobileActionComplete,
}: MobileUserMenuProps) => {
  return <InteractiveSignInButton onNavigationStart={onMobileActionComplete} />;
};

export default MobileUserSigninOrAvatar;
