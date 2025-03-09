
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ServiceTypeHeaderProps {
  defectType: string;
  maintenanceAction: boolean;
  onMaintenanceActionChange: (checked: boolean) => void;
}

const ServiceTypeHeader: React.FC<ServiceTypeHeaderProps> = ({
  defectType,
  maintenanceAction,
  onMaintenanceActionChange
}) => {
  return (
    <div className="flex items-center space-x-4 mb-4">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 rounded-full bg-blue-500"></div>
        <span className="font-bold">PIREP DEFECT</span>
      </div>
      
      <div className="flex items-center space-x-2 ml-auto">
        <Checkbox 
          id="maintenanceAction" 
          checked={maintenanceAction} 
          onCheckedChange={(checked) => 
            onMaintenanceActionChange(checked === true)
          }
        />
        <label htmlFor="maintenanceAction" className="text-white font-medium">
          MAINT. ACTION
        </label>
      </div>
    </div>
  );
};

export default ServiceTypeHeader;
