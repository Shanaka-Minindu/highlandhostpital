"use client";
import React from "react";
import PaginationControls from "@/components/molecules/pagination-controls";
import ReviewList from "@/components/molecules/review-list";
import StarRating from "@/components/molecules/star-rating";
import { usePaginatedReviews } from "@/hooks/use-pagination-reviews";
import { PAGE_SIZE } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";

interface doctorProfile {
  doctorId: string;
  averageRating: number;
}

const DoctorProfileReview = ({ doctorId, averageRating }: doctorProfile) => {
  const {
    currentPage,
    error,
    handlePageChange,
    loading,
    reviews,
    totalPages,
    totalReviews,
  } = usePaginatedReviews(doctorId);

  return (
    <Card className="w-full border-0 bg-background rounded-lg shadow-sm overflow-hidden">
      <CardContent className="p-6 md:p-8 flex flex-col gap-8">
        
        {/* Header Section: Title and Average Rating Summary */}
        <div className="flex  flex-row  justify-between gap-4 items-center">
          <h3 className="">Patient Reviews</h3>
          
          <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-lg  border-border-2/50">
            <span >
              <h1>{averageRating.toFixed(1)}</h1>
            </span>
            <div className="flex flex-col">
              <StarRating rating={averageRating} showDigits={false} />
              <span className="text-sm text-text-body-subtle font-medium">
                {totalReviews} reviews
              </span>
            </div>
          </div>
        </div>

        {/* Content Section: Review List */}
        <div className={loading ? "opacity-50 transition-opacity" : "opacity-100"}>
          {error ? (
            <div className="py-10 text-center text-red-500">{error}</div>
          ) : (
            <ReviewList
              currentPage={currentPage}
              reviews={reviews}
              reviewsPerPage={PAGE_SIZE}
              totalReviews={totalReviews}
            />
          )}
        </div>

        {/* Footer Section: Pagination Information and Controls */}
        {totalPages>1 &&
        <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-border-2/50 gap-4">
          <div className="text-text-body-subtle text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          
          <PaginationControls
            currentPage={currentPage}
            onPageChange={handlePageChange}
            totalPages={totalPages}
            isDisabled={loading}
            siblingCount={1}
          />
        </div>
}
      </CardContent>
    </Card>
  );
};

export default DoctorProfileReview;