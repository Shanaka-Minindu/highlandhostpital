import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PatientProfile } from "@/types";
import { Edit } from "lucide-react";
import React from "react";

interface PersonalInformationProps {
  personalInfo: PatientProfile;
  editBtn: () => void;
}
const PersonalInformation = ({
  editBtn,
  personalInfo,
}: PersonalInformationProps) => {
  return (
    <div>
      <Card className="border-0 py-8 px-4">
        <CardHeader className="flex flex-row justify-between">
          <h3 className="text-text-title">Personal Information</h3>
          <Button onClick={editBtn} className="text-text-primary hover:text-text-primary/80 h-auto flex items-center" variant="ghost">
            <Edit  size={14}/>
            <div className="font-semibold">Edit</div>
          </Button>
        </CardHeader>
        <CardContent >
          <div className="grid md:grid-cols-2 gap-4 px-3">
            <div>
              <div className="text-text-body-subtle body-small">Full Name</div>
              <div className="text-text-title ">{personalInfo.name || "N/A"}</div>
            </div>
            <div>
              <div className="text-text-body-subtle body-small">Email</div>
              <div className="text-text-title ">{personalInfo.email}</div>
            </div>
            <div>
              <div className="text-text-body-subtle body-small">Phone</div>
              <div className="text-text-title ">{personalInfo.phoneNumber || "N/A"}</div>
            </div>
            <div>
              <div className="text-text-body-subtle body-small">Address</div>
              <div className="text-text-title ">{personalInfo.address || "N/A"}</div>
            </div>
            <div>
              <div className="text-text-body-subtle body-small">Date of Birth</div>
              <div className="text-text-title ">{personalInfo.dateOfBirth? new Date(personalInfo.dateOfBirth+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric", month:"long" ,year:"numeric"}) : "N/A"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInformation;
