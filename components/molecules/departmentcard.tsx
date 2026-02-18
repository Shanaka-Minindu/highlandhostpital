import { Card, CardContent } from "@/components/ui/card"
import { getIconComponent } from '@/lib/utils';

interface DepartmentCardProps {
id: string,
  name: string;
  iconName: string;
}

const DepartmentCard = ({ 
  name ,
  iconName 
}: DepartmentCardProps) => {
        const IconComponent =   getIconComponent(iconName)
  return (
    <Card className=" cursor-pointer w-full  border-border-2 p-0  transition-all duration-300 hover:shadow-lg hover:border-[#1fb0ff]/40">
      <CardContent className="flex flex-col gap-4 items-center justify-center p-6">
        {/* Icon Section */}
        <div className=" transition-transform duration-300 group-hover:scale-110">
          <IconComponent  className='h-8 w-8  stroke-primary fill-primary'/> 
        </div>

        {/* Title Section */}
        <h3 className="text-text-title truncate w-full text-center">
          {name}
        </h3>
      </CardContent>
    </Card>
  )
}

export default DepartmentCard