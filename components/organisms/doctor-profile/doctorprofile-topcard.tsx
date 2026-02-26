
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { DoctorTopCard } from "@/types";
import StarRating from "@/components/molecules/star-rating";

const DoctorProfileTopCard = ({
  image,
  name,
  specialty,
  credentials,
  languages,
  rating,
  reviewCount,
  specializations,
}: DoctorTopCard) => {
  return (
    <Card className="w-full border-border-2 rounded-xl overflow-hidden shadow-sm">
      <CardContent className="p-0 flex flex-col md:flex-row">
        {/* Left Side: Doctor Image */}
        <div className="relative w-full md:w-[350px] md:ml-5 aspect-square md:aspect-auto h-[350px] md:h-auto overflow-hidden rounded-xl">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 350px"
              priority
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
              No Image Available
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
          {/* Header Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-title mb-1">
              {name}, {credentials}
            </h1>
            <p className="text-xl text-text-body-subtle font-medium mb-3">
              {specialty}
            </p>

            <div className="flex items-center gap-2">
              
                <StarRating rating={rating}/>
              
              <span className="font-bold text-text-title text-lg">
                {rating.toFixed(1)}
              </span>
              <span className="text-text-body-subtle">
                ({reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Info Blocks */}
          <div className="space-y-4">
            {/* Languages Block */}
            <div className="p-4 rounded-xl border border-border-2 bg-slate-50/50">
              <p className="text-sm font-semibold text-text-body-subtle uppercase tracking-wider mb-1">
                Languages
              </p>
              <p className="font-bold text-text-title">
                {languages.join(", ")}
              </p>
            </div>

            {/* Specialization Block */}
            <div className="p-4 rounded-xl border border-border-2 bg-slate-50/50">
              <p className="text-sm font-semibold text-text-body-subtle uppercase tracking-wider mb-1">
                Specialisation
              </p>
              <p className="font-bold text-text-title leading-relaxed">
                {specializations.join(", ")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorProfileTopCard;
