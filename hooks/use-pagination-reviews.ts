"use client";

import { useState, useEffect, useCallback } from "react";
import { PAGE_SIZE } from "@/lib/constants";
import { TestimonialDataTyp } from "@/types";
import { getDoctorReviewPaginated } from "@/lib/actions/testimonials.action";

export const usePaginatedReviews = (
  doctorId: string,
  initialPage: number = 1,
  reviewsPerPage: number = PAGE_SIZE,
) => {
  // State management
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [reviews, setReviews] = useState<TestimonialDataTyp[]>([]);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDoctorReviewPaginated(
        reviewsPerPage,
        currentPage,
        doctorId
      );

      if (response.success && response.data) {
        setReviews(response.data.reviews);
        setTotalReviews(response.data.totalReviews);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.message || "Failed to fetch reviews");
      }
    } catch (err) {
      setError("An unexpected error occurred while loading reviews.");
    } finally {
      setLoading(false);
    }
  }, [doctorId, currentPage, reviewsPerPage]);

  // Trigger fetch when doctorId or currentPage changes
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Expose function to change page
  const handlePageChange = (newPage: number) => {
    // Prevent navigating out of bounds
    if (newPage >= 1 && (totalPages === 0 || newPage <= totalPages)) {
      setCurrentPage(newPage);
    }
  };

  return {
    currentPage,
    reviews,
    totalReviews,
    totalPages,
    loading,
    error,
    handlePageChange,
  };
};