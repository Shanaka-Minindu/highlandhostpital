"use client";

import React, { useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { X, AlertCircle } from "lucide-react";

const ErrorNotification = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const encodedMessage = searchParams.get("errorMessage");
  const errorMessage = decodeURI(encodedMessage||"");
  // We don't need errorType for this specific design but we keep it to clear params
  const errorType = searchParams.get("errorType"); 

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("errorMessage");
    params.delete("errorType");
    
    const query = params.toString() ? `?${params.toString()}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  }, [searchParams, router, pathname]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, handleClose]);

  if (!errorMessage) return null;

  return (
    /* Changes:
       - top-0 left-0 w-full: Positions it at the very top, full width
       - -translate-x-0: Removed centering translate trick
    */
    <div className="fixed top-0 left-0 z-[100] w-full animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3 w-full p-4 bg-red-600 shadow-xl ring-1 ring-black/5">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* We now use the main errorMessage text in a simple white paragraph */}
          <p className="text-sm font-semibold text-white break-words">
            {errorMessage}
          </p>
        </div>

        <button
          onClick={handleClose}
          className="ml-auto flex-shrink-0 text-red-100 hover:text-white transition-colors p-1"
          aria-label="Close notification"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ErrorNotification;