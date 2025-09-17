import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DateTimeSectionProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  validationErrors?: Record<string, boolean>;
}

export const DateTimeSection = ({
  date,
  time,
  onDateChange,
  onTimeChange,
  validationErrors,
}: DateTimeSectionProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className={cn("grid gap-4", isMobile ? "grid-cols-2" : "grid-cols-2")}>
      <div>
        <label
          className={cn(
            "font-medium mb-2 block uppercase",
            isMobile ? "text-base" : "text-lg"
          )}
        >
          Date *
        </label>
        <div className="relative">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal",
                  isMobile ? "w-full h-12 text-base" : "w-[160px]",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? format(new Date(date), "dd/MM/yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={cn(
                "w-auto p-0 bg-white",
                isMobile && "w-[90vw] max-w-[350px]"
              )}
              align="start"
            >
              <Calendar
                mode="single"
                selected={date ? new Date(date) : undefined}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    onDateChange(format(selectedDate, "yyyy-MM-dd"));
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
                className={cn("pointer-events-auto", isMobile ? "p-2" : "p-3")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div>
        <label
          className={cn(
            "font-medium mb-2 block uppercase",
            isMobile ? "text-base" : "text-lg"
          )}
        >
          Time *
        </label>
        <TimePicker
          value={time}
          onChange={onTimeChange}
          isError={validationErrors?.time}
          className={isMobile ? "h-12 text-base" : ""}
        />
        {validationErrors?.time && (
          <p className="text-red-500 text-sm mt-1">Time is required</p>
        )}
      </div>
    </div>
  );
};
