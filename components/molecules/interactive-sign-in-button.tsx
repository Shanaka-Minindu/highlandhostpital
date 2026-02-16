"use client"

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogIn } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface InteractiveSignInButton {
          onNavigationStart?:()=>void;
          className?:string
}

const InteractiveSignInButton = ({onNavigationStart, className}:InteractiveSignInButton) => {
  // isPending is true while the transition (navigation) is in progress
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSignIn = () => {
    // startTransition wraps the navigation logic
    startTransition(() => {
      router.push('/sign-in')
          if(onNavigationStart){
                    onNavigationStart();
          }
      
    })
  }

  return (
    <Button 
      variant="secondary" 
      className={className}
      onClick={handleSignIn}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Sign in
        </>
      )}
    </Button>
  )
}

export default InteractiveSignInButton