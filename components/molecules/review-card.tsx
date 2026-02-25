import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ReviewCardProps {
  id: string;
  patientName: string;
  patientImage: string;
  rating: number;
  testimonialText: string;
  reviewDate: string;
}

const ReviewCard = ({
  id,
  patientName ,
  patientImage,
  rating,
  testimonialText ,
  reviewDate,
}: ReviewCardProps) => {
  return (
    <Card className="w-full max-w-md border-border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        {/* Patient Avatar using Next.js Image */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-gray-100">
          {patientImage ? (
            <Image
              src={patientImage}
              alt={`Profile picture of ${patientName}`}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">{patientName}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <h3 className="font-bold text-text-title text-lg leading-none mb-1 truncate">
            {patientName}
          </h3>

          {/* Dynamic Star Rating */}
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 ">
        {/* Review Body */}
        <p className="text-text-body-subtle leading-relaxed italic line-clamp-3">
          &quot;{testimonialText}&quot;
        </p>

        {/* reviewDate Stamp */}
        <p className="text-text-caption-1 body-small ">{reviewDate.split("T")[0]}</p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
