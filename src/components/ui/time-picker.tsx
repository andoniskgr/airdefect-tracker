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
  const [inputDigits, setInputDigits] = useState<string[]>([]);
  
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
    // Get only digit characters
    const input = e.target.value.replace(/[^\d]/g, '');
    
    // Process new digit
    if (input.length > 0) {
      // Get the last digit if there are multiple digits entered at once
      const lastDigit = input.charAt(input.length - 1);
      
      // Manage the input digits array
      let newDigits = [...inputDigits];
      if (input.length > inputDigits.join('').length) {
        // Add the new digit
        newDigits.push(lastDigit);
        if (newDigits.length > 4) {
          // Keep only the last 4 digits
          newDigits = newDigits.slice(newDigits.length - 4);
        }
      } else {
        // Handle backspace - remove last digit
        newDigits.pop();
      }
      
      setInputDigits(newDigits);
      
      // Format time based on digits entered
      let formattedTime = "";
      if (newDigits.length === 1) {
        formattedTime = `00:0${newDigits[0]}`;
      } else if (newDigits.length === 2) {
        formattedTime = `00:${newDigits[0]}${newDigits[1]}`;
      } else if (newDigits.length === 3) {
        formattedTime = `0${newDigits[0]}:${newDigits[1]}${newDigits[2]}`;
      } else if (newDigits.length === 4) {
        formattedTime = `${newDigits[0]}${newDigits[1]}:${newDigits[2]}${newDigits[3]}`;
      }
      
      // Validate hours and minutes
      if (formattedTime) {
        const [hours, minutes] = formattedTime.split(':').map(num => parseInt(num, 10));
        
        // Validate hours (0-23)
        if (hours > 23) {
          formattedTime = `23:${minutes < 10 ? '0' + minutes : minutes}`;
        }
        
        // Validate minutes (0-59)
        if (minutes > 59) {
          formattedTime = `${hours < 10 ? '0' + hours : hours}:59`;
        }
        
        onChange(formattedTime);
      }
    } else {
      // Clear input
      setInputDigits([]);
      onChange('');
    }
  };

  const setCurrentTime = () => {
    const now = new Date();
    const timeStr = format(now, 'HH:mm');
    onChange(timeStr);
    
    // Set the input digits from the current time
    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(3, 5);
    setInputDigits([...hours.split(''), ...minutes.split('')]);
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
