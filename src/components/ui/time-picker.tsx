
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
  disabled?: boolean;
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
  onEnterPress,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update local state when value prop changes from external sources
  useEffect(() => {
    // Only update if the component's internal value doesn't match the prop
    // and the input isn't focused (to avoid overriding user typing)
    if (value !== inputValue && document.activeElement !== inputRef.current) {
      setInputValue(value || '');
    }
  }, [value]);
  
  const formatTimeInput = (input: string): string => {
    // Remove any non-digit characters
    const digitsOnly = input.replace(/[^\d]/g, '');
    
    // If we have 4 or more digits, format as HH:MM
    if (digitsOnly.length >= 4) {
      const hours = Math.min(parseInt(digitsOnly.substring(0, 2), 10), 23);
      const minutes = Math.min(parseInt(digitsOnly.substring(2, 4), 10), 59);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else if (digitsOnly.length > 0) {
      // Handle partial input (less than 4 digits)
      if (digitsOnly.length <= 2) {
        // Just hours, pad with leading zero if needed
        const hours = Math.min(parseInt(digitsOnly, 10), 23);
        return `${hours.toString().padStart(2, '0')}:00`;
      } else {
        // Hours and partial minutes
        const hours = Math.min(parseInt(digitsOnly.substring(0, 2), 10), 23);
        const minutes = Math.min(parseInt(digitsOnly.substring(2), 10), 59);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    
    // Return empty string if no valid input
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // For direct typing, allow digits and colon
    if (/^[\d:]*$/.test(input) && input.length <= 5) {
      setInputValue(input);
    }
  };
  
  const handleBlur = () => {
    // Format time on blur
    if (inputValue.trim()) {
      const formattedTime = formatTimeInput(inputValue);
      setInputValue(formattedTime);
      onChange(formattedTime);
    } else {
      onChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
      if (onEnterPress) {
        onEnterPress();
      }
    }
  };

  const setCurrentTime = () => {
    const now = new Date();
    const timeStr = format(now, 'HH:mm');
    setInputValue(timeStr);
    onChange(timeStr);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="HH:MM"
        className={cn(
          "text-lg w-[80px]",
          isError && "bg-red-50 border-red-200 focus-visible:ring-red-300"
        )}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="outline"
        className="px-3"
        onClick={setCurrentTime}
        disabled={disabled}
      >
        <span className="sr-only">Set current time</span>
        <Clock />
      </Button>
    </div>
  );
};

export { TimePicker };
