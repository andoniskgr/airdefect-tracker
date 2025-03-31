
import React, { useState, useEffect } from 'react';
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
  const [internalDefect, setInternalDefect] = useState(defect);
  const [internalRemarks, setInternalRemarks] = useState(remarks);

  // Update internal state when props change
  useEffect(() => {
    setInternalDefect(defect);
  }, [defect]);

  useEffect(() => {
    setInternalRemarks(remarks);
  }, [remarks]);

  const handleDefectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setInternalDefect(newValue);
    onDefectChange(newValue);
  };
  
  const handleRemarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setInternalRemarks(newValue);
    onRemarksChange(newValue);
  };
  
  return (
    <>
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">Defect Description</label>
        <Input
          ref={defectRef}
          value={internalDefect}
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
          value={internalRemarks}
          onChange={handleRemarksChange}
          onKeyDown={(e) => handleKeyDown(e, 'remarks')}
          placeholder="REMARKS"
          className="text-lg uppercase"
        />
      </div>
    </>
  );
};
