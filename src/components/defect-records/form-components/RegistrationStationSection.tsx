
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AircraftAutocomplete } from '../AircraftAutocomplete';

interface RegistrationStationSectionProps {
  registration: string;
  station: string;
  onRegistrationChange: (value: string) => void;
  onStationChange: (value: string) => void;
  registrationRef: React.RefObject<HTMLInputElement>;
  stationRef: React.RefObject<HTMLInputElement>;
  validationErrors: Record<string, boolean>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => void;
}

export const RegistrationStationSection = ({
  registration,
  station,
  onRegistrationChange,
  onStationChange,
  registrationRef,
  stationRef,
  validationErrors,
  handleKeyDown
}: RegistrationStationSectionProps) => {
  const [internalStation, setInternalStation] = useState(station);
  
  // Update internal state when props change
  useEffect(() => {
    setInternalStation(station);
  }, [station]);
  
  const handleStationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    const newValue = value.slice(0, 6);
    setInternalStation(newValue);
    onStationChange(newValue);
  };
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">Registration</label>
        <AircraftAutocomplete 
          inputRef={registrationRef}
          value={registration}
          onChange={onRegistrationChange}
          onKeyDown={(e) => handleKeyDown(e, 'registration')}
          validationError={validationErrors.registration}
          autoFocus={true}
        />
      </div>
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">Station</label>
        <Input
          ref={stationRef}
          value={internalStation}
          onChange={handleStationChange}
          onKeyDown={(e) => handleKeyDown(e, 'station')}
          placeholder="STATION"
          className={cn(
            "text-lg uppercase w-[120px]",
            validationErrors.station && "bg-red-50 border-red-200 focus-visible:ring-red-300"
          )}
          maxLength={6}
        />
      </div>
    </div>
  );
};
