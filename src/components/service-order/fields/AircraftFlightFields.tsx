import React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAircraftData } from "@/hooks/useAircraftData";

interface AircraftFlightFieldsProps {
  aircraft: string;
  flight: string;
  from: string;
  to: string;
  validationErrors: Record<string, boolean>;
  handleAircraftChange: (value: string) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const AircraftFlightFields: React.FC<AircraftFlightFieldsProps> = ({
  aircraft,
  flight,
  from,
  to,
  validationErrors,
  handleAircraftChange,
  handleInputChange,
}) => {
  const { aircraftList } = useAircraftData();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div>
        <Select value={aircraft} onValueChange={handleAircraftChange}>
          <SelectTrigger
            className={cn(
              "bg-white text-black w-full max-w-[15ch]",
              validationErrors.aircraft && "bg-red-100"
            )}
          >
            <SelectValue placeholder="SELECT A/C" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {aircraftList.map((aircraft) => (
              <SelectItem key={aircraft.id} value={aircraft.registration}>
                {aircraft.registration}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Input
          type="text"
          name="flight"
          value={flight}
          onChange={handleInputChange}
          placeholder="FLIGHT"
          className={cn(
            "bg-white text-black max-w-[12ch]",
            validationErrors.flight && "bg-red-100"
          )}
          required
        />
      </div>

      <div>
        <Input
          type="text"
          name="from"
          onChange={handleInputChange}
          value={from}
          placeholder="FROM"
          className={cn(
            "bg-white text-black max-w-[12ch]",
            validationErrors.from && "bg-red-100"
          )}
          required
        />
      </div>

      <div>
        <Input
          type="text"
          name="to"
          value={to}
          onChange={handleInputChange}
          placeholder="TO"
          className={cn(
            "bg-white text-black max-w-[12ch]",
            validationErrors.to && "bg-red-100"
          )}
          required
        />
      </div>
    </div>
  );
};

export default AircraftFlightFields;
