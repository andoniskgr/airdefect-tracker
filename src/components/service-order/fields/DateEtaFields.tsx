
import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TimePicker } from "@/components/ui/time-picker";

interface DateEtaFieldsProps {
  date?: Date;
  etaUtc: string;
  atDestAirport: boolean;
  validationErrors: Record<string, boolean>;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
}

const DateEtaFields: React.FC<DateEtaFieldsProps> = ({
  date,
  etaUtc,
  atDestAirport,
  validationErrors,
  calendarOpen,
  setCalendarOpen,
  handleInputChange,
  handleCheckboxChange
}) => {
  const handleEtaChange = (value: string) => {
    handleInputChange({
      target: { name: 'etaUtc', value }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleEtaEnterPress = () => {
    // Optional: Add any specific behavior needed when Enter is pressed in the ETA field
  };

  return (
    <div className="flex items-start gap-6">
      <div>
        <label className="text-sm font-medium mb-1 block text-white">Date</label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full max-w-[24ch] justify-start text-left font-normal bg-white text-black hover:bg-white/90",
                !date && "text-muted-foreground",
                validationErrors.date && "bg-red-100"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd/MM/yyyy") : "SELECT DATE"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white" align="start">
            <Calendar
              mode="single"
              selected={date}
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
        <label className="text-sm font-medium mb-1 block text-white">ETA (UTC)</label>
        <TimePicker 
          value={etaUtc}
          onChange={handleEtaChange}
          onEnterPress={handleEtaEnterPress}
          isError={validationErrors.etaUtc}
          disabled={atDestAirport}
        />
      </div>
      
      <div className="flex items-center space-x-2 mt-6">
        <Checkbox 
          id="atDestAirport" 
          checked={atDestAirport} 
          onCheckedChange={(checked) => 
            handleCheckboxChange('atDestAirport', checked === true)
          }
        />
        <label htmlFor="atDestAirport" className="text-white text-sm whitespace-nowrap">
          At Dest. Airport
        </label>
      </div>
    </div>
  );
};

export default DateEtaFields;
