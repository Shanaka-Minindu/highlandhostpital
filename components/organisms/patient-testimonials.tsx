import React from "react";

import { testimonialData } from "@/db/dummydata";
import ReviewCard from "../molecules/review-card";

interface TestimonialDataTyp{
          id: string,
patientName:string,
rating: number,
testimonialText:string,
reviewDate:string,
patientImage?: string
}

const PatientTestimonials = () => {
 
          
          const TestimonialData: TestimonialDataTyp[] = testimonialData;


  const hasTestimonials = TestimonialData && TestimonialData.length > 0;

  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-text-title mb-2">
          Patient Testimonials
        </h2>
      </div>

      {/* Grid Layout or Empty State Rendering */}
      {hasTestimonials ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {TestimonialData.map((review) => (
            <ReviewCard
              key={review.id}
              id={review.id}
              patientName={review.patientName}
              patientImage={review.patientImage||""}
              rating={review.rating}
              testimonialText={review.testimonialText}
              reviewDate={review.reviewDate}
            />
          ))}
        </div>
      ) : (
        /* Empty State Message */
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <p className="text-text-body-subtle text-lg font-medium">
            Patient Testimonials not found
          </p>
        </div>
      )}
    </section>
  );
};

export default PatientTestimonials;
