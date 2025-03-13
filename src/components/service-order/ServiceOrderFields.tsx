
import React from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { ServiceOrderData } from "./types";
import { useAircraftData } from "@/hooks/useAircraftData";
import { Textarea } from "@/components/ui/textarea";

interface ServiceOrderFieldsProps {
  formData: ServiceOrderData;
  validationErrors: Record<string, boolean>;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
}

const ServiceOrderFields: React.FC<ServiceOrderFieldsProps> = ({
  formData,
  validationErrors,
  calendarOpen,
  setCalendarOpen,
  handleInputChange,
  handleCheckboxChange
}) => {
  const { aircraftList } = useAircraftData();

  const handleAircraftChange = (value: string) => {
    handleInputChange({
      target: { name: 'aircraft', value }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Select 
            value={formData.aircraft} 
            onValueChange={handleAircraftChange}
          >
            <SelectTrigger
              className={cn(
                "bg-white text-black w-full",
                validationErrors.aircraft && "bg-red-100"
              )}
            >
              <SelectValue placeholder="SELECT A/C" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {aircraftList.map((aircraft) => (
                <SelectItem 
                  key={aircraft.id} 
                  value={aircraft.registration}
                >
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
            value={formData.flight}
            onChange={handleInputChange}
            placeholder="FLIGHT" 
            className={cn(
              "bg-white text-black",
              validationErrors.flight && "bg-red-100"
            )}
            required
          />
        </div>
        
        <div>
          <Input 
            type="text" 
            name="from"
            value={formData.from}
            onChange={handleInputChange}
            placeholder="FROM" 
            className={cn(
              "bg-white text-black",
              validationErrors.from && "bg-red-100"
            )}
            required
          />
        </div>
        
        <div>
          <Input 
            type="text" 
            name="to"
            value={formData.to}
            onChange={handleInputChange}
            placeholder="TO" 
            className={cn(
              "bg-white text-black",
              validationErrors.to && "bg-red-100"
            )}
            required
          />
        </div>
        
        <div>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-white text-black hover:bg-white/90",
                  !formData.date && "text-muted-foreground",
                  validationErrors.date && "bg-red-100"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, "dd/MM/yyyy") : "SELECT DATE"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => {
                  if (date) {
                    handleInputChange({
                      target: { name: 'date', value: date.toString() }
                    } as React.ChangeEvent<HTMLInputElement>);
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Input 
            type="text" 
            name="etaUtc"
            value={formData.etaUtc}
            onChange={handleInputChange}
            placeholder="ETA UTC" 
            className={cn(
              "bg-white text-black",
              validationErrors.etaUtc && "bg-red-100"
            )}
            disabled={formData.atDestAirport}
            required={!formData.atDestAirport}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox 
          id="atDestAirport" 
          checked={formData.atDestAirport} 
          onCheckedChange={(checked) => 
            handleCheckboxChange('atDestAirport', checked === true)
          }
        />
        <label htmlFor="atDestAirport" className="text-white font-medium">
          At Dest. Airport
        </label>
      </div>
      
      {formData.defectType === "PIREP" ? (
        <div className="mb-4">
          <Input 
            type="text" 
            name="defectDescription"
            value={formData.defectDescription}
            onChange={handleInputChange}
            placeholder="DEFECT DESCRIPTION" 
            className={cn(
              "bg-white text-black w-full",
              validationErrors.defectDescription && "bg-red-100"
            )}
            required
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input 
            type="text" 
            name="mel"
            value={formData.mel}
            onChange={handleInputChange}
            placeholder="MEL" 
            className={cn(
              "bg-white text-black",
              validationErrors.mel && "bg-red-100"
            )}
            required
          />
          <Input 
            type="text" 
            name="melDescription"
            value={formData.melDescription}
            onChange={handleInputChange}
            placeholder="MEL DESCRIPTION" 
            className={cn(
              "bg-white text-black",
              validationErrors.melDescription && "bg-red-100"
            )}
            required
          />
        </div>
      )}
      
      <div className="mb-4">
        <label className="block mb-2">Prepared text</label>
        <Textarea 
          name="preparedText"
          value={formData.preparedText}
          className="w-full h-96 p-2 bg-white text-black rounded-md font-mono text-sm"
          placeholder="Enter prepared text here..."
          readOnly
        />
      </div>
    </>
  );
};

export default ServiceOrderFields;
