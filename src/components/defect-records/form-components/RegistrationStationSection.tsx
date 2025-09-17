import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AircraftAutocomplete } from "../AircraftAutocomplete";
import { useIsMobile } from "@/hooks/use-mobile";

interface RegistrationStationSectionProps {
  registration: string;
  station: string;
  onRegistrationChange: (value: string) => void;
  onStationChange: (value: string) => void;
  registrationRef: React.RefObject<HTMLInputElement>;
  stationRef: React.RefObject<HTMLInputElement>;
  validationErrors: Record<string, boolean>;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    fieldName: string
  ) => void;
}

export const RegistrationStationSection = ({
  registration,
  station,
  onRegistrationChange,
  onStationChange,
  registrationRef,
  stationRef,
  validationErrors,
  handleKeyDown,
}: RegistrationStationSectionProps) => {
  // Internal state for station to prevent cursor jumping
  const [stationValue, setStationValue] = useState(station);
  const isMobile = useIsMobile();

  // Store cursor position
  const stationCursorPosition = useRef<number | null>(null);

  // Update local state when props change from external source
  useEffect(() => {
    if (
      station !== stationValue &&
      document.activeElement !== stationRef.current
    ) {
      setStationValue(station);
    }
  }, [station, stationValue, stationRef]);

  // Restore cursor position
  useEffect(() => {
    if (
      stationCursorPosition.current !== null &&
      stationRef.current &&
      document.activeElement === stationRef.current
    ) {
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
    <div className={cn("grid gap-4", isMobile ? "grid-cols-2" : "grid-cols-2")}>
      <div>
        <label
          className={cn(
            "font-medium mb-2 block uppercase",
            isMobile ? "text-base" : "text-lg"
          )}
        >
          Registration *
        </label>
        <AircraftAutocomplete
          inputRef={registrationRef}
          value={registration}
          onChange={onRegistrationChange}
          onKeyDown={(e) => handleKeyDown(e, "registration")}
          validationError={validationErrors.registration}
          autoFocus={true}
          className={isMobile ? "h-12 text-base" : ""}
        />
      </div>
      <div>
        <label
          className={cn(
            "font-medium mb-2 block uppercase",
            isMobile ? "text-base" : "text-lg"
          )}
        >
          Station *
        </label>
        <Input
          ref={stationRef}
          value={stationValue}
          onChange={handleStationChange}
          onKeyDown={(e) => handleKeyDown(e, "station")}
          placeholder="STATION"
          className={cn(
            "uppercase",
            isMobile ? "h-12 text-base w-full" : "text-lg w-[120px]",
            validationErrors.station &&
              "bg-red-50 border-red-200 focus-visible:ring-red-300"
          )}
          maxLength={6}
        />
      </div>
    </div>
  );
};
