import React from 'react';
import Image from 'next/image';
import { getBannerImg } from '@/lib/actions/settings.actions';

const HomeBanner = async () => {
  // Fetch banner data from the Server Action
  const response = await getBannerImg();

  // 1. Handle Error State
  if (response.data == null || !response.success) {
    console.error("Banner Error:", response.error);
    // You could return a simple colored div or a default fallback UI here
    return (
      <section className="w-full h-[400px] bg-slate-200 flex items-center justify-center">
        <p className="text-slate-500">Service temporarily unavailable</p>
      </section>
    );
  }

  // 2. Handle Empty Data State
  const banners = response.data;
  if (!banners || banners.length === 0) {
    return null; // Or show a default placeholder image
  }

  // Get the first banner (sorted by 'order' from our server action)
  const activeBanner = banners[0];

  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Background Image from Database */}
      <Image
        src={activeBanner.imageUrl}
        alt={activeBanner.name}
        fill
        priority // Crucial for LCP since this is the top-fold image
        className="object-cover"
        sizes="100vw"
        quality={90} // Improved quality for high-resolution screens
      />

      {/* Dark Overlay for Text Contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-4xl space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md">
            Welcome to Highland Medical Center
          </h1>
          
          <p className="text-lg md:text-xl text-slate-100 font-medium max-w-2xl mx-auto drop-shadow-sm">
            Excellence in Healthcare, Committed to Your Well-being
          </p>
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;