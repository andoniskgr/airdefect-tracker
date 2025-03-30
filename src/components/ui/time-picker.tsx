import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  isError?: boolean;
  onEnterPress?: () => void;
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

const TimePicker: React.FC<TimePickerProps> = ({ 
  value, 
  onChange, 
  className, 
  isError = false,
  onEnterPress
}) => {
  const [inputDigits, setInputDigits] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize input digits from value prop
  useEffect(() => {
    if (value && value.includes(':')) {
      const [hours, minutes] = value.split(':');
      setInputDigits([...hours.split(''), ...minutes.split('')]);
    } else {
      setInputDigits([]);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // If the input contains a colon, it's a formatted time
    if (input.includes(':')) {
      onChange(input);
      return;
    }
    
    // Get only digit characters
    const digitsOnly = input.replace(/[^\d]/g, '');
    
    if (digitsOnly.length > 0) {
      // Create a new array with the digits
      let newDigits: string[] = [];
      
      // If input is shorter than current digits, assume backspace
      if (digitsOnly.length < inputDigits.join('').length) {
        newDigits = digitsOnly.split('');
      } else {
        // Handle adding new digits
        newDigits = digitsOnly.split('');
        if (newDigits.length > 4) {
          // Keep only the last 4 digits
          newDigits = newDigits.slice(newDigits.length - 4);
        }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
  };

  const setCurrentTime = () => {
    const now = new Date();
    const timeStr = format(now, 'HH:mm');
    onChange(timeStr);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="HH:MM"
        className={cn(
          "text-lg uppercase w-[80px]",
          isError && "bg-red-50 border-red-200 focus-visible:ring-red-300"
        )}
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
