
import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DefectType } from "../types";

interface DefectFieldsProps {
  defectType: DefectType;
  defectDescription: string;
  mel: string;
  melDescription: string;
  validationErrors: Record<string, boolean>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const DefectFields: React.FC<DefectFieldsProps> = ({
  defectType,
  defectDescription,
  mel,
  melDescription,
  validationErrors,
  handleInputChange
}) => {
  if (defectType === "PIREP") {
    return (
      <div className="mt-4">
        <Input 
          type="text" 
          name="defectDescription"
          value={defectDescription}
          onChange={handleInputChange}
          placeholder="DEFECT DESCRIPTION" 
          className={cn(
            "bg-white text-black w-full",
            validationErrors.defectDescription && "bg-red-100"
          )}
          required
        />
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <Input 
        type="text" 
        name="mel"
        value={mel}
        onChange={handleInputChange}
        placeholder="MEL" 
        className={cn(
          "bg-white text-black",
          validationErrors.mel && "bg-red-100"
        )}
        required
      />
      <Input 
        type="text" 
        name="melDescription"
        value={melDescription}
        onChange={handleInputChange}
        placeholder="MEL DESCRIPTION" 
        className={cn(
          "bg-white text-black",
          validationErrors.melDescription && "bg-red-100"
        )}
        required
      />
    </div>
  );
};

export default DefectFields;
