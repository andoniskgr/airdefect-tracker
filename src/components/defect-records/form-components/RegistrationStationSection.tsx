
import React, { useState, useEffect, useRef } from 'react';
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
  // Internal state for station to prevent cursor jumping
  const [stationValue, setStationValue] = useState(station);
  
  // Store cursor position
  const stationCursorPosition = useRef<number | null>(null);
  
  // Update local state when props change from external source
  useEffect(() => {
    if (station !== stationValue && document.activeElement !== stationRef.current) {
      setStationValue(station);
    }
  }, [station, stationValue, stationRef]);
  
  // Restore cursor position
  useEffect(() => {
    if (stationCursorPosition.current !== null && 
        stationRef.current && 
        document.activeElement === stationRef.current) {
      const pos = Math.min(stationCursorPosition.current, stationValue.length);
      stationRef.current.setSelectionRange(pos, pos);
      stationCursorPosition.current = null;
    }
  });
  
  const handleStationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    const newValue = value.slice(0, 6);
    
    // Save cursor position before update
    stationCursorPosition.current = e.target.selectionStart;
    
    setStationValue(newValue);
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
          value={stationValue}
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
