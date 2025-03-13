
import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full max-w-[12ch] justify-start text-left font-normal bg-white text-black hover:bg-white/90",
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
          <Input 
            type="text" 
            name="etaUtc"
            value={etaUtc}
            onChange={handleInputChange}
            placeholder="ETA UTC" 
            className={cn(
              "bg-white text-black max-w-[12ch]",
              validationErrors.etaUtc && "bg-red-100"
            )}
            disabled={atDestAirport}
            required={!atDestAirport}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="atDestAirport" 
          checked={atDestAirport} 
          onCheckedChange={(checked) => 
            handleCheckboxChange('atDestAirport', checked === true)
          }
        />
        <label htmlFor="atDestAirport" className="text-white font-medium">
          At Dest. Airport
        </label>
      </div>
    </>
  );
};

export default DateEtaFields;
