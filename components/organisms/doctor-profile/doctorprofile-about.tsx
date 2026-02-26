import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DoctorAbout } from '@/types'

const DoctorProfileAbout = ({ brief, name }: DoctorAbout) => {
  // Extracting the last name for the title (e.g., "Dr. Sarah Mitchell" -> "Mitchell")
  const nameParts = name.split(' ');
  const lastName = nameParts[nameParts.length - 1];

  return (
    <Card className="w-full border-border-2 rounded-xl gap-1 shadow-sm overflow-hidden">
      <CardHeader >
        <CardTitle className="text-2xl font-bold text-text-title">
          About Dr. {lastName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="m-0" >
        <p className="text-text-body-subtle leading-relaxed text-lg whitespace-pre-line">
          {brief}
        </p>
      </CardContent>
    </Card>
  )
}

export default DoctorProfileAbout