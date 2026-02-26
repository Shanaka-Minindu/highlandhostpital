import DoctorProfileAbout from "@/components/organisms/doctor-profile/doctorprofile-about";
import DoctorProfileTopCard from "@/components/organisms/doctor-profile/doctorprofile-topcard";
import { getDoctorById } from "@/lib/actions/doctor.actions";
import { notFound } from "next/navigation";
import React from "react";

interface Params {
  doctorId: string;
}
const DoctorProfilePage = async ({ params }: { params: Promise<Params> }) => {
  const docId = await params;
  const { doctorId } = docId;

  let docData;

  try {
    const result = await getDoctorById(doctorId);
    if (result.success || result.data) {
      docData = result;
      console.log(result.data);
    } else {
      notFound();
    }
  } catch (error) {
    console.log(error);
    return (
      <div className="p-6 text-center text-red-500">
        <p>We're Sorry, Something went wrong!!</p>
        <p>Please try refreshing the page or check back later</p>
      </div>
    );
  }

  if (!docData.success) {
    if (docData.errorType === "DATABASE_ERROR") {
      notFound();
    }

    console.error(
      `Failed to fetch doctor data for ${docId}`,
      docData.message,
      docData.error,
    );
    <div className="p-6 text-center text-red-50">
      <p>Could not load doctor profile</p>
      <p>Please try again later</p>
    </div>;
  }

  const doctorData = docData.data;
  if (doctorData == undefined) {
    return notFound();
  }
  return (
    <div className="flex w-full flex-col md:flex-row justify-between">
      <div className="flex flex-col gap-6 md:gap-8 md:max-w-[908px]">
        <div>
          <DoctorProfileTopCard
            credentials={doctorData.credentials}
            rating={doctorData.rating}
            brief={doctorData.brief}
            id={doctorData.id}
            languages={doctorData.languages}
            image={doctorData.image}
            name={doctorData.name}
            reviewCount={doctorData.reviewCount}
            specializations={doctorData.specializations}
            specialty={doctorData.specialty}
          />
        </div>
        <div className="md:hidden"> Appointment Schedule</div>
        <DoctorProfileAbout brief={doctorData.brief} name={doctorData.name}/>
        <div>Reviews</div>
      </div>
      <div className="hidden md:block">Appointment Schedule</div>
    </div>
  );
};

export default DoctorProfilePage;
