import { Star, StarHalf } from 'lucide-react'


interface StarRatingProps {
  rating: number;
  showDigits?: boolean;
}

const StarRating = ({ rating, showDigits = true }: StarRatingProps) => {
  // Ensure rating stays between 0 and 5
  const normalizedRating = Math.max(0, Math.min(5, rating));

  return (
    <div className="flex items-center gap-2">
      {/* Star Icons Container */}
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          const starIndex = i + 1;
          
          // Full Star
          if (starIndex <= Math.floor(normalizedRating)) {
            return (
              <Star 
                key={i} 
                className="h-5 w-5 fill-yellow-400 text-yellow-400" 
              />
            );
          }
          
          // Half Star logic
          if (starIndex === Math.ceil(normalizedRating) && !Number.isInteger(normalizedRating)) {
            return (
              <div key={i} className="relative">
                <Star className="h-5 w-5 text-gray-200" />
                <div className="absolute inset-0 overflow-hidden w-[50%]">
                   <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            );
          }

          // Empty Star
          return (
            <Star 
              key={i} 
              className="h-5 w-5 text-gray-200" 
            />
          );
        })}
      </div>

      {/* Numerical Digits */}
      {/* {showDigits && (
        <span className="font-bold text-text-title text-lg ml-1">
          {normalizedRating.toFixed(1)}
        </span>
      )} */}
    </div>
  )
}

export default StarRating