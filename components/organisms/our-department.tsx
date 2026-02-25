import React from "react";
import DepartmentCard from "@/components/molecules/departmentcard";
import { departmentData } from "@/db/dummydata";

import { getDepartments } from "@/lib/actions/settings.actions";
import { Department } from "@/lib/generated/prisma/client";

// interface DepartmentData {
//   id: string;
//   name: string;
//   iconName: string;
// }

const OurDepartments = async () => {
  // const DepartmentData: DepartmentData[] = departmentData;
  let DepartmentData :Department[] = [];
  let fetchError : string|null = null;

  try{
    const result = await getDepartments();
    if(result.success&& result.data){
      DepartmentData = result.data.departments;
    }else{
      fetchError = result.message || "Failed to fetch departments"
    }
  }catch(error){
    const msg = error instanceof Error? error.message : "Failed to load department";
    fetchError = msg;
  }

  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-text-title mb-2">
          Our Departments
        </h2>
      </div>

      {/* Responsive Grid System */}
      {DepartmentData.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No Department Found
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(176px,1fr))] lg:grid-cols-6  justify-center gap-4 md:gap-6 lg:gap-8">
          {DepartmentData.map((dept) => (
            <DepartmentCard
              key={dept.id}
              id={dept.id}
              name={dept.name}
              iconName={dept.iconName}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default OurDepartments;
