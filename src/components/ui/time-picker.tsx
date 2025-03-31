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
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  
  // Update local state when value prop changes from external sources only
  useEffect(() => {
    if (value !== inputValue && document.activeElement !== inputRef.current) {
      setInputValue(value);
    }
  }, [value]);
  
  const validateAndFormatTime = (input: string): string => {
    // If input contains a colon, it may already be formatted
    if (input.includes(':')) {
      const [hours, minutes] = input.split(':');
      
      // Check if hours and minutes are valid numbers
      const hoursNum = parseInt(hours, 10);
      const minutesNum = parseInt(minutes, 10);
      
      if (!isNaN(hoursNum) && !isNaN(minutesNum)) {
        // Validate and format
        const validHours = Math.min(Math.max(0, hoursNum), 23);
        const validMinutes = Math.min(Math.max(0, minutesNum), 59);
        
        return `${validHours.toString().padStart(2, '0')}:${validMinutes.toString().padStart(2, '0')}`;
      }
    }
    
    // Get only digit characters
    const digitsOnly = input.replace(/[^\d]/g, '');
    
    if (digitsOnly.length === 0) return '';
    
    // Format based on number of digits
    if (digitsOnly.length <= 2) {
      // Assume minutes only
      const minutes = parseInt(digitsOnly, 10);
      if (minutes > 59) {
        return '00:59';
      }
      return `00:${digitsOnly.padStart(2, '0')}`;
    } else if (digitsOnly.length === 3) {
      // One digit hour, two digit minutes
      const hour = parseInt(digitsOnly[0], 10);
      const minutes = parseInt(digitsOnly.slice(1), 10);
      
      if (minutes > 59) {
        return `0${hour}:59`;
      }
      return `0${hour}:${digitsOnly.slice(1).padStart(2, '0')}`;
    } else {
      // At least two digit hour, two digit minutes
      const hour = parseInt(digitsOnly.slice(0, 2), 10);
      const minutes = parseInt(digitsOnly.slice(2, 4), 10);
      
      const validHour = Math.min(hour, 23);
      const validMinutes = Math.min(isNaN(minutes) ? 0 : minutes, 59);
      
      return `${validHour.toString().padStart(2, '0')}:${validMinutes.toString().padStart(2, '0')}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const curPos = e.target.selectionStart;
    const oldLength = inputValue.length;
    
    // Store cursor position adjusted for potential formatting
    if (curPos !== null) {
      const isAddingChars = input.length > oldLength;
      
      // Check if user is adding digits
      if (isAddingChars) {
        const addedDigits = (input.match(/\d/g) || []).length - (inputValue.match(/\d/g) || []).length;
        // If adding digits, advance cursor appropriately
        if (addedDigits > 0) {
          // For intelligently moving cursor forward
          setCursorPosition(curPos + (input.includes(':') && !inputValue.includes(':') ? 1 : 0));
        } else {
          setCursorPosition(curPos);
        }
      } else {
        // If removing characters, try to keep cursor at same position
        setCursorPosition(curPos);
      }
    }
    
    // Update local state immediately for responsive UI
    setInputValue(input);
    setIsFormatting(true);
    
    // Debounce the validation and onChange propagation
    const timeoutId = setTimeout(() => {
      // Only format if we have input
      if (input.trim()) {
        const formattedTime = validateAndFormatTime(input);
        setInputValue(formattedTime);
        onChange(formattedTime);
      } else {
        // Empty input
        onChange('');
      }
      
      // Once formatting is done
      setIsFormatting(false);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };
  
  // Restore cursor position after render, but only if not actively formatting
  useEffect(() => {
    if (cursorPosition !== null && inputRef.current && !isFormatting) {
      // Ensure cursor position doesn't exceed input length
      const safePosition = Math.min(cursorPosition, inputValue.length);
      inputRef.current.setSelectionRange(safePosition, safePosition);
    }
  }, [inputValue, cursorPosition, isFormatting]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnterPress) {
      e.preventDefault();
      onEnterPress();
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
        onKeyDown={handleKeyDown}
        placeholder="HH:MM"
        className={cn(
          "text-lg uppercase w-[80px]",
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
