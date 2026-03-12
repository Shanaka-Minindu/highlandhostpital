import { Suspense } from "react"; // 1. Import Suspense
import OurDepartments from "@/components/organisms/our-department";
import OurDoctors from "@/components/organisms/our-doctor";
import PatientTestimonials from "@/components/organisms/patient-testimonials";
import HomeBanner from "@/components/organisms/home-banner";
import ErrorNotification from "@/components/molecules/error-notification";

export default function Home() {
  return (
    <div>
      {/* 2. Wrap the offending component */}
      <Suspense fallback={null}> 
        <ErrorNotification />
      </Suspense>

      <HomeBanner />
      <div className="flex-col gap-12">
        <p className="mt-12 max-w-3xl mx-auto text-center ">
          Welcome to Highland Medical Center, your premier destination for
          specialized healthcare consultation. Our facility brings together
          exceptional physicians across all major medical departments, offering
          expert diagnosis and personalized treatment planning in one convenient
          location.
        </p>
        <OurDepartments />
      </div>
      <div id="our-doctors">
        <OurDoctors />
      </div>

      <PatientTestimonials />
    </div>
  );
}