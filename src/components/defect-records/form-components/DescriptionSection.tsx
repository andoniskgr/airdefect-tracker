import React, { useState, useRef, useEffect } from 'react';
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
  const [defectValue, setDefectValue] = useState(defect);
  const [remarksValue, setRemarksValue] = useState(remarks);
  
  const defectCursorPosition = useRef<number | null>(null);
  const remarksCursorPosition = useRef<number | null>(null);
  
  useEffect(() => {
    if (defect !== defectValue && document.activeElement !== defectRef.current) {
      setDefectValue(defect);
    }
  }, [defect, defectValue, defectRef]);
  
  useEffect(() => {
    if (remarks !== remarksValue && document.activeElement !== remarksRef.current) {
      setRemarksValue(remarks);
    }
  }, [remarks, remarksValue, remarksRef]);
  
  useEffect(() => {
    if (defectCursorPosition.current !== null && 
        defectRef.current && 
        document.activeElement === defectRef.current) {
      const pos = Math.min(defectCursorPosition.current, defectValue.length);
      defectRef.current.setSelectionRange(pos, pos);
      defectCursorPosition.current = null;
    }
  });
  
  useEffect(() => {
    if (remarksCursorPosition.current !== null && 
        remarksRef.current && 
        document.activeElement === remarksRef.current) {
      const pos = Math.min(remarksCursorPosition.current, remarksValue.length);
      remarksRef.current.setSelectionRange(pos, pos);
      remarksCursorPosition.current = null;
    }
  });
  
  const handleDefectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    defectCursorPosition.current = e.target.selectionStart;
    setDefectValue(newValue);
    onDefectChange(newValue);
  };
  
  const handleRemarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    remarksCursorPosition.current = e.target.selectionStart;
    setRemarksValue(newValue);
    onRemarksChange(newValue);
  };
  
  return (
    <>
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">Defect Description</label>
        <Input
          ref={defectRef}
          value={defectValue}
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
          value={remarksValue}
          onChange={handleRemarksChange}
          onKeyDown={(e) => handleKeyDown(e, 'remarks')}
          placeholder="REMARKS"
          className="text-lg uppercase"
        />
      </div>
    </>
  );
};
