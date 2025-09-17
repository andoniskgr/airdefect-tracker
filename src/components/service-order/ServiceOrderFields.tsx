import React from "react";
import { ServiceOrderData } from "./types";
import AircraftFlightFields from "./fields/AircraftFlightFields";
import DateEtaFields from "./fields/DateEtaFields";
import DefectFields from "./fields/DefectFields";
import PreparedTextField from "./fields/PreparedTextField";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ServiceOrderFieldsProps {
  formData: ServiceOrderData;
  validationErrors: Record<string, boolean>;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
}

const ServiceOrderFields: React.FC<ServiceOrderFieldsProps> = ({
  formData,
  validationErrors,
  calendarOpen,
  setCalendarOpen,
  handleInputChange,
  handleCheckboxChange,
}) => {
  const isMobile = useIsMobile();

  const handleAircraftChange = (value: string) => {
    handleInputChange({
      target: { name: "aircraft", value },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <>
      <div className={cn("mb-3", isMobile && "mb-6")}>
        <div
          className={cn(
            "flex space-y-2",
            isMobile
              ? "flex-col"
              : "md:flex-row md:items-center md:space-x-2 md:space-y-0"
          )}
        >
          <AircraftFlightFields
            aircraft={formData.aircraft}
            flight={formData.flight}
            from={formData.from}
            to={formData.to}
            validationErrors={validationErrors}
            handleAircraftChange={handleAircraftChange}
            handleInputChange={handleInputChange}
          />

          <DateEtaFields
            date={formData.date}
            etaUtc={formData.etaUtc}
            atDestAirport={formData.atDestAirport}
            validationErrors={validationErrors}
            calendarOpen={calendarOpen}
            setCalendarOpen={setCalendarOpen}
            handleInputChange={handleInputChange}
            handleCheckboxChange={handleCheckboxChange}
          />
        </div>
      </div>

      <div className={cn("mb-3", isMobile && "mb-6")}>
        <DefectFields
          defectType={formData.defectType}
          defectDescription={formData.defectDescription}
          mel={formData.mel}
          melDescription={formData.melDescription}
          validationErrors={validationErrors}
          handleInputChange={handleInputChange}
        />
      </div>

      <div className={cn("mb-3", isMobile && "mb-6")}>
        <PreparedTextField preparedText={formData.preparedText} />
      </div>
    </>
  );
};

export default ServiceOrderFields;
