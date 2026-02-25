import React from "react";

import { doctorData } from "@/db/dummydata";
import DoctorCard from "../molecules/doctorcard";

import { getOurDoctors } from "@/lib/actions/doctor.actions";
import { DoctorData } from "@/types";

// interface OurDoctorsTyp {
//   id: string;
//   name: string;
//   specialty: string;
//   rating: number;
//   reviewCount: number;
//   imageUrl: string;
// }
const OurDoctors =async () => {
  // Check if data exists and has items
  let DoctorData: DoctorData[] = [];
let fetchError : string

try{
const result = await getOurDoctors();
if(result.success&& result.data){
  DoctorData = result.data
}else{
  fetchError = result.message || "Failed to fetch Doctors"
}
}catch(error){
const msg = error instanceof Error? error.message : "Failed to load Doctors";
    fetchError = msg;
}

  const hasDoctors = DoctorData && DoctorData.length > 0;

  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-text-title mb-2">
          Our Doctors
        </h2>
      </div>

      {/* Conditional Rendering for Data and Empty State */}
      {hasDoctors ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center mx-auto gap-6">
          {DoctorData.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              id={doctor.id}
              name={doctor.name}
              specialty={doctor.specialty}
              rating={doctor.rating}
              reviewCount={doctor.reviewCount}
              imageUrl={doctor.imageUrl}
            />
          ))}
        </div>
      ) : (
        /* Empty State Message */
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <p className="text-text-body-subtle text-lg font-medium">
            Doctors not found
          </p>
        </div>
      )}
    </section>
  );
};

export default OurDoctors;
