
import React from "react";
import { ServiceOrderData, DefectType } from "./types";
import ServiceTypeHeader from "./ServiceTypeHeader";
import ServiceOrderFields from "./ServiceOrderFields";
import ServiceOrderActions from "./ServiceOrderActions";
import PreparedTextField from "./fields/PreparedTextField";

interface ServiceOrderFormProps {
  formData: ServiceOrderData;
  validationErrors: Record<string, boolean>;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleDefectTypeChange: (value: DefectType) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  handlePrepareAndCopy: () => void;
  handleClear: () => void;
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
  formData,
  validationErrors,
  calendarOpen,
  setCalendarOpen,
  handleInputChange,
  handleDefectTypeChange,
  handleCheckboxChange,
  handlePrepareAndCopy,
  handleClear
}) => {
  return (
    <div className="bg-slate-700 rounded-lg p-4 shadow-lg w-full">
      <ServiceTypeHeader 
        defectType={formData.defectType}
        onDefectTypeChange={handleDefectTypeChange}
      />
      
      <ServiceOrderFields 
        formData={formData}
        validationErrors={validationErrors}
        calendarOpen={calendarOpen}
        setCalendarOpen={setCalendarOpen}
        handleInputChange={handleInputChange}
        handleCheckboxChange={handleCheckboxChange}
      />
      
      <ServiceOrderActions 
        onPrepareAndCopy={handlePrepareAndCopy}
        onClear={handleClear}
      />
      
      {formData.preparedText && (
        <PreparedTextField preparedText={formData.preparedText} />
      )}
    </div>
  );
};

export default ServiceOrderForm;
