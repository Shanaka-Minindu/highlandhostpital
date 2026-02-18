import OurDepartments from "@/components/organisms/our-department";
import OurDoctors from "@/components/organisms/our-doctor";
import PatientTestimonials from "@/components/organisms/patient-testimonials";
import HomeBanner from "@/components/organisms/home-banner";
export default function Home() {
  return (
    <div>
      <HomeBanner />
      <div className="flex-col gap-12">
      <p className="mt-12 max-w-3xl mx-auto text-center ">Welcome to Highland Medical Center, your premier destination for specialized healthcare consultation. Our facility brings together exceptional physicians across all major medical departments, offering expert diagnosis and personalized treatment planning in one convenient location. </p>
      <OurDepartments />
</div>
<div id="our-doctors"><OurDoctors /></div>
      

      <PatientTestimonials />
    </div>
  );
}
