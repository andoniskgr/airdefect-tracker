
import React from "react";
import { format } from "date-fns";
import { ServiceOrderData } from "./types";
import ServiceTypeHeader from "./ServiceTypeHeader";
import ServiceOrderFields from "./ServiceOrderFields";
import ServiceOrderActions from "./ServiceOrderActions";

interface ServiceOrderFormProps {
  formData: ServiceOrderData;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  handlePrepareAndCopy: () => void;
  handleClear: () => void;
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
  formData,
  calendarOpen,
  setCalendarOpen,
  handleInputChange,
  handleCheckboxChange,
  handlePrepareAndCopy,
  handleClear
}) => {
  return (
    <div className="bg-slate-700 rounded-lg p-4 shadow-lg">
      <ServiceTypeHeader 
        defectType={formData.defectType}
        maintenanceAction={formData.maintenanceAction}
        onMaintenanceActionChange={(checked) => 
          handleCheckboxChange('maintenanceAction', checked)
        }
      />
      
      <ServiceOrderFields 
        formData={formData}
        calendarOpen={calendarOpen}
        setCalendarOpen={setCalendarOpen}
        handleInputChange={handleInputChange}
        handleCheckboxChange={handleCheckboxChange}
      />
      
      <ServiceOrderActions 
        onPrepareAndCopy={handlePrepareAndCopy}
        onClear={handleClear}
      />
    </div>
  );
};

export default ServiceOrderForm;
