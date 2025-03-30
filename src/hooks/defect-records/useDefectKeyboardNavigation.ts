
import React from 'react';

interface KeyboardNavigationProps {
  refs: {
    registrationRef: React.RefObject<HTMLInputElement>;
    stationRef: React.RefObject<HTMLInputElement>;
    defectRef: React.RefObject<HTMLInputElement>;
    remarksRef: React.RefObject<HTMLInputElement>;
  };
  validateAndSubmit: () => void;
}

export const useDefectKeyboardNavigation = ({ refs, validateAndSubmit }: KeyboardNavigationProps) => {
  const { registrationRef, stationRef, defectRef, remarksRef } = refs;
  
  const handleEnterOnField = (fieldName: string) => {
    switch(fieldName) {
      case 'registration':
        stationRef.current?.focus();
        break;
      case 'station':
        defectRef.current?.focus();
        break;
      case 'defect':
        remarksRef.current?.focus();
        break;
      case 'remarks':
        validateAndSubmit();
        break;
      default:
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnterOnField(fieldName);
    }
  };

  return {
    handleKeyDown
  };
};
