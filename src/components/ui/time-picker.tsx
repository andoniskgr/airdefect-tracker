
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Clock icon component
const Clock = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className }) => {
  const [open, setOpen] = useState(false);
  
  // Generate time options in 30-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const time = new Date();
      time.setHours(hour, minute, 0);
      timeOptions.push(format(time, 'HH:mm'));
    }
  }

  const handleTimeSelection = (time: string) => {
    onChange(time);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and format them
    const numbers = e.target.value.replace(/[^\d]/g, '');
    if (numbers.length <= 4) {
      const hours = numbers.slice(0, 2);
      const minutes = numbers.slice(2, 4);
      
      let formattedTime = '';
      if (hours) {
        const hoursNum = parseInt(hours);
        if (hoursNum >= 24) {
          formattedTime = '23:';
        } else {
          formattedTime = hours.padStart(2, '0') + ':';
        }
        
        if (minutes) {
          const minutesNum = parseInt(minutes);
          if (minutesNum >= 60) {
            formattedTime += '59';
          } else {
            formattedTime += minutes.padStart(2, '0');
          }
        } else if (numbers.length > 2) {
          formattedTime += '00';
        }
      }
      
      if (formattedTime && formattedTime.includes(':') || formattedTime === '') {
        onChange(formattedTime);
      }
    }
  };

  const setCurrentTime = () => {
    const now = new Date();
    const timeStr = format(now, 'HH:mm');
    onChange(timeStr);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {value || 'Select time'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 h-[300px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {timeOptions.map((time) => (
              <Button
                key={time}
                variant="outline"
                onClick={() => handleTimeSelection(time)}
                className={cn(
                  "justify-center",
                  time === value && "bg-primary text-primary-foreground"
                )}
              >
                {time}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder="HH:MM"
        className="text-lg uppercase w-[80px]"
      />
      <Button
        type="button"
        variant="outline"
        className="px-3"
        onClick={setCurrentTime}
      >
        <span className="sr-only">Set current time</span>
        <Clock />
      </Button>
    </div>
  );
};

export { TimePicker };
