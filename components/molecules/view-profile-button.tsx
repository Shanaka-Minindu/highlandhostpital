"use client";

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

interface ViewProfileButtonProps {
  id: string;
}

const ViewProfileButton = ({ id }: ViewProfileButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleNavigate = () => {
    startTransition(() => {
      // Navigate to the dynamic doctor profile route
      router.push(`/doctors/${id}`);
    });
  };

  return (
    <Button 
      variant="brand" 
      className="w-full py-6 text-lg text-text-caption-2 font-semibold"
      onClick={handleNavigate}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading Profile...
        </>
      ) : (
        "View Profile"
      )}
    </Button>
  );
};

export default ViewProfileButton;