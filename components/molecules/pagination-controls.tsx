import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";

interface paginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount: number;
  isDisabled?: boolean;
}

const PaginationControls = ({
  currentPage,
  onPageChange,
  siblingCount = 1,
  totalPages,
  isDisabled,
}: paginationControlsProps) => {
  // Prevent interactions if disabled or there's only one page
  if (totalPages <= 1) return null;
  const pageRange = usePagination({ currentPage, totalPages, siblingCount });
  return (
    <Pagination className={isDisabled ? "pointer-events-none opacity-50" : ""}>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            aria-disabled={currentPage === 1}
            className={
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {/* Dynamic Page Numbers */}
        {pageRange.map((page, index) => (
          <PaginationItem key={index}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Number(page));
                }}
                isActive={currentPage === page}
                aria-disabled={isDisabled}
                className={`${isDisabled ? "pointer-events-none opacity-50" : "cursor-pointer"}${page === currentPage ? "border-border-2" : ""}`}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            aria-disabled={currentPage === totalPages}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
