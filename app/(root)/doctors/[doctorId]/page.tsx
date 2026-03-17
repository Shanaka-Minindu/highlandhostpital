import { auth } from "@/auth";
import DoctorProfileAbout from "@/components/organisms/doctor-profile/doctorprofile-about";
import DoctorProfileReview from "@/components/organisms/doctor-profile/doctorprofile-review";
import DoctorProfileTopCard from "@/components/organisms/doctor-profile/doctorprofile-topcard";
import ScheduleAppointment from "@/components/organisms/doctor-profile/schedule-appointment";
import { cleanUpReservedAppointment } from "@/lib/actions/appointment.actions";
import { getDoctorById } from "@/lib/actions/doctor.actions";
import { notFound } from "next/navigation";
import React from "react";

interface Params {
  doctorId: string;
}
const DoctorProfilePage = async ({ params }: { params: Promise<Params> }) => {
  const docId = await params;
  const { doctorId } = docId;

  await cleanUpReservedAppointment();

  const session = await auth();
  const userId = session?.user?.id ? session.user.id : undefined;
  const role = session?.user?.role ? session.user.role : undefined;

  let docData;

  try {
    const result = await getDoctorById(doctorId);
    if (result.success || result.data) {
      docData = result;
    } else {
      notFound();
    }
  } catch (error) {
    console.log(error);
    return (
      <div className="p-6 text-center text-red-500">
        <p>We&apos;re Sorry, Something went wrong!!</p>
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
    <div className="flex w-full mx-auto justify-center max-w-[1376px] flex-col md:flex-row gap-7 p-4">
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
        <div className="md:hidden">
          {" "}
          <ScheduleAppointment
            doctorId={doctorData.id}
            userId={userId}
            userRole={role}
          />
        </div>
        <DoctorProfileAbout brief={doctorData.brief} name={doctorData.name} />
        <DoctorProfileReview
          doctorId={doctorData.id}
          averageRating={doctorData.rating}
        />
      </div>
      <div className="hidden md:block">
        <ScheduleAppointment
          doctorId={doctorData.id}
          userId={userId}
          userRole={role}
        />
      </div>
    </div>
  );
};

export default DoctorProfilePage;
