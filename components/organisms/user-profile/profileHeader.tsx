"use client";

import React, { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadButton } from "@/lib/uploadthing";
import { updateUserImage } from "@/lib/actions/user.actions";
import { PatientProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProfileHeaderProps {
  userData: PatientProfile;
  appointmentId?: string;
}

const ProfileHeader = ({ userData,appointmentId }: ProfileHeaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter()
  // 1. Create a ref to the hidden UploadButton container
  const uploadButtonRef = useRef<HTMLDivElement>(null);

  const initials = userData.name?.charAt(0).toUpperCase() || "U";

  const [getImage,setImage] = useState(userData.image)

  // 2. Function to trigger the click on the internal UploadThing input
  const handleAvatarClick = () => {
    if (isUploading) return;
    
    // Find the actual button/input inside the UploadButton component and click it
    const fileInput = uploadButtonRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="flex justify-between items-center">
    <div className="flex items-center gap-6 py-8">
      {/* Profile Image Section */}
      <div className="relative group">
        <Avatar 
          onClick={handleAvatarClick}
          className={`h-24 w-24 border-2 border-slate-100 shadow-sm overflow-hidden bg-slate-50 relative 
            ${isUploading ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <AvatarImage
            src={getImage}
            alt={userData.name}
            className="object-cover"
          />
          <AvatarFallback className="text-3xl font-bold text-slate-400 bg-slate-100">
            {initials}
          </AvatarFallback>

          {/* Hover/Loading Overlay */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300
            ${isUploading 
                ? "bg-black/40 opacity-100" 
                : "bg-black/30 opacity-0 group-hover:opacity-100"
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : (
              <>
                <Camera className="h-8 w-8 text-white mb-1" />
                <span className="text-[10px] font-medium text-white uppercase tracking-wider">
                  Update
                </span>
              </>
            )}
          </div>
        </Avatar>

        {/* 3. Hidden UploadButton Container */}
        <div ref={uploadButtonRef} className="hidden">
          <UploadButton
            endpoint="imageUploader"
            onUploadBegin={() => setIsUploading(true)}
            onClientUploadComplete={async (res) => {
              if (res && res[0]) {
                setImage(res[0].ufsUrl);
                const result = await updateUserImage(res[0].ufsUrl);
                if (result.success) {
                  toast.success("Profile picture updated!");
                } else {
                  toast.error(result.message || "Update failed");
                  
                }
              }
              setIsUploading(false);
            }}
            onUploadError={(error: Error) => {
              setIsUploading(false);
              toast.error(`Upload Error: ${error.message}`);
            }}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-text-title tracking-tight">
          {userData.name}
        </h1>
        <p className="text-slate-500 font-medium">
            {userData.email}
        </p>
      </div>
    </div>
    {appointmentId?<Button onClick={()=>{
      router.push(`/appointments/patient-details?appointmentId=${appointmentId}`)
    }}> Back to Appointment</Button>:<></>}
    </div>
  );
};

export default ProfileHeader;