
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DefectType } from "./types";

interface ServiceTypeHeaderProps {
  defectType: DefectType;
  onDefectTypeChange: (value: DefectType) => void;
}

const ServiceTypeHeader: React.FC<ServiceTypeHeaderProps> = ({
  defectType,
  onDefectTypeChange
}) => {
  return (
    <div className="mb-6">
      <RadioGroup 
        value={defectType} 
        onValueChange={(value) => onDefectTypeChange(value as DefectType)}
        className="flex space-x-8 items-center"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="PIREP" id="defect-pirep" />
          <Label htmlFor="defect-pirep" className="font-bold text-white">
            PIREP DEFECT
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="MAINT" id="defect-maint" />
          <Label htmlFor="defect-maint" className="font-bold text-white">
            MAINT. ACTION
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ServiceTypeHeader;
