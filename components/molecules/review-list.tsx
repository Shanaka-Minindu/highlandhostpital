import React from "react";
import { TestimonialDataTyp } from "@/types";
import StarRating from "./star-rating";
import { Separator } from "@/components/ui/separator";

interface reviewListProps {
  reviews: TestimonialDataTyp[];
  currentPage: number;
  totalReviews: number;
  reviewsPerPage: number;
}

const ReviewList = ({
  currentPage,
  reviews,
  reviewsPerPage,
  totalReviews,
}: reviewListProps) => {
  // Calculate range for "Showing X-Y of Z reviews"
  const startRange = (currentPage - 1) * reviewsPerPage + 1;
  const endRange = Math.min(currentPage * reviewsPerPage, totalReviews);

  return (
    <div className=" w-full">
      {/* Pagination Info */}
      <div className="text-text-body-subtle text-sm mb-5">
        Showing {startRange}-{endRange} of {totalReviews} reviews
      </div>

      <div className="flex flex-col">
        {reviews.map((review, index) => (
          <div key={review.id} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {/* Use the StarRating without digits for the list view */}
                <StarRating rating={review.rating} showDigits={false} />
                <span className="text-text-body-subtle text-sm font-normal">
                  {review.reviewDate.split("T")[0]}
                </span>
              </div>

              {/* Testimonial Text */}
              <p className="text-text-body-subtle text-lg leading-relaxed">
                &quot;{review.testimonialText}&quot;
              </p>

              {/* Patient Name with dash prefix */}
              <p className="text-text-body-subtle font-normal">
                - {review.patientName}
              </p>
            </div>

            {/* Render separator after every review except the last one */}
            {index < reviews.length - 1 && (
              <Separator className="my-6 bg-border-2/50" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;