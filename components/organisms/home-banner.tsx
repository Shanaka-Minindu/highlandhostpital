import React from 'react'
import Image from 'next/image'
import { bannerImageData } from '@/db/dummydata'

const HomeBanner = () => {
  // Use the first banner image from dummy data or a fallback
  const banner = bannerImageData[0];

  if (!banner) return null;

  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Background Image */}
      <Image
        src={banner.imageUrl}
        alt={banner.name}
        fill
        priority // Important for LCP (Largest Contentful Paint)
        className="object-cover"
        sizes="100vw"
      />

      {/* Dark Overlay for Text Contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-4xl space-y-4">
          <h1 className="text-3xl md:text-5xl  font-bold text-white tracking-tight">
            Welcome to Highland Medical Center
          </h1>
          
          <p className="text-lg md:text-xl text-slate-100 font-medium max-w-2xl mx-auto">
            Excellence in Healthcare, Committed to Your Well-being
          </p>
        </div>
      </div>
    </section>
  )
}

export default HomeBanner