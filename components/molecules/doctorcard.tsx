import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import ViewProfileButton from "./view-profile-button";

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
}

const DoctorCard = ({
  id,
  name,
  specialty,
  rating,
  reviewCount,
  imageUrl,
}: DoctorCardProps) => {
  return (
    <Card className="w-full max-w-sm p-0 border-border-2 gap-4 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          {/* Next.js Optimized Image Container */}
          <div className="relative aspect-square w-12 md:w-16 shrink-0 overflow-hidden rounded-full border border-gray-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`Portrait of ${name}`}
                fill
                className="object-cover"
                sizes="80px"
                priority={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-4xl">{name.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Doctor Details */}
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className=" text-text-title truncate">{name}</h3>
            <p className="text-text-body-subtle  truncate">{specialty}</p>

            {/* Rating Section */}
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-text-title">
                {rating.toFixed(1)}
              </span>
              <span className="text-text-body-subtle text-sm">
                ({reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pb-6 px-6">
        <ViewProfileButton id={id} />
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;
