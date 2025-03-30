
import React from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DescriptionSectionProps {
  defect: string;
  remarks: string;
  onDefectChange: (value: string) => void;
  onRemarksChange: (value: string) => void;
  defectRef: React.RefObject<HTMLInputElement>;
  remarksRef: React.RefObject<HTMLInputElement>;
  validationErrors: Record<string, boolean>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => void;
}

export const DescriptionSection = ({
  defect,
  remarks,
  onDefectChange,
  onRemarksChange,
  defectRef,
  remarksRef,
  validationErrors,
  handleKeyDown
}: DescriptionSectionProps) => {
  const handleDefectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDefectChange(e.target.value.toUpperCase());
  };
  
  const handleRemarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRemarksChange(e.target.value.toUpperCase());
  };
  
  return (
    <>
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">Defect Description</label>
        <Input
          ref={defectRef}
          value={defect}
          onChange={handleDefectChange}
          onKeyDown={(e) => handleKeyDown(e, 'defect')}
          placeholder="DESCRIPTION"
          className={cn(
            "text-lg uppercase",
            validationErrors.defect && "bg-red-50 border-red-200 focus-visible:ring-red-300"
          )}
        />
      </div>
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">Remarks</label>
        <Input
          ref={remarksRef}
          value={remarks}
          onChange={handleRemarksChange}
          onKeyDown={(e) => handleKeyDown(e, 'remarks')}
          placeholder="REMARKS"
          className="text-lg uppercase"
        />
      </div>
    </>
  );
};
