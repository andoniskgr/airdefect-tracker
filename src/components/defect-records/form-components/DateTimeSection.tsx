
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker } from '@/components/ui/time-picker';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface DateTimeSectionProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export const DateTimeSection = ({ date, time, onDateChange, onTimeChange }: DateTimeSectionProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">Date</label>
        <div className="relative">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? format(new Date(date), "dd/MM/yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={date ? new Date(date) : undefined}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    onDateChange(format(selectedDate, 'yyyy-MM-dd'));
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">Time</label>
        <TimePicker
          value={time}
          onChange={onTimeChange}
        />
      </div>
    </div>
  );
};
