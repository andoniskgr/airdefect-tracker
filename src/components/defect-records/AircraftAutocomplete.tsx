
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebaseDB";

interface AircraftAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  autoFocus?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  validationError?: boolean;
}

export const AircraftAutocomplete: React.FC<AircraftAutocompleteProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "REGISTRATION",
  className,
  maxLength = 6,
  autoFocus = false,
  inputRef,
  validationError = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [registrations, setRegistrations] = useState<string[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Fetch aircraft registrations from Firestore
  useEffect(() => {
    const fetchAircraftData = async () => {
      try {
        const aircraftCollection = collection(db, 'aircraft');
        const aircraftSnapshot = await getDocs(aircraftCollection);
        const aircraftRegs = aircraftSnapshot.docs.map(doc => 
          doc.data().registration as string
        ).filter(Boolean);
        
        // Remove duplicates
        const uniqueRegs = [...new Set(aircraftRegs)];
        setRegistrations(uniqueRegs);
      } catch (error) {
        console.error("Error fetching aircraft data:", error);
      }
    };
    
    fetchAircraftData();
  }, []);
  
  // Filter registrations based on input value
  useEffect(() => {
    if (!value) {
      setFilteredRegistrations([]);
      setIsOpen(false);
      return;
    }
    
    // Filter registrations that contain the input value (case insensitive)
    const filtered = registrations.filter(reg => 
      reg.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredRegistrations(filtered);
    setIsOpen(filtered.length > 0);
  }, [value, registrations]);
  
  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.toUpperCase();
    // Only slice if maxLength is provided and value exceeds it
    const finalValue = maxLength ? inputValue.slice(0, maxLength) : inputValue;
    onChange(finalValue);
  };
  
  const handleItemClick = (registration: string) => {
    onChange(registration);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={containerRef}>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        onFocus={() => {
          if (value && filteredRegistrations.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className={cn(
          "text-lg uppercase w-[120px]",
          validationError && "bg-red-50 border-red-200 focus-visible:ring-red-300",
          className
        )}
        maxLength={maxLength}
        autoFocus={autoFocus}
      />
      
      {isOpen && filteredRegistrations.length > 0 && (
        <div className="absolute z-50 mt-1 w-40 rounded-md bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto py-1 text-base">
            {filteredRegistrations.map((registration) => (
              <li
                key={registration}
                className="cursor-pointer select-none px-4 py-2 hover:bg-blue-100 text-black"
                onClick={() => handleItemClick(registration)}
              >
                {registration}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
