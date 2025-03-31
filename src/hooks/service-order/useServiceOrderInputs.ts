
import { useState } from "react";
import { ServiceOrderData, DefectType } from "@/components/service-order/types";

export const useServiceOrderInputs = (initialFormData: ServiceOrderData) => {
  const [formData, setFormData] = useState<ServiceOrderData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for date
    if (name === 'date' && value) {
      setFormData(prev => ({ ...prev, [name]: new Date(value) }));
      return;
    }
    
    // Convert input to uppercase
    const upperCaseValue = value.toUpperCase();
    
    setFormData(prev => ({ ...prev, [name]: upperCaseValue }));
    
    // Clear validation error for this field if it exists
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDefectTypeChange = (value: DefectType) => {
    setFormData(prev => ({ ...prev, defectType: value }));
    // Clear validation errors when switching type
    setValidationErrors({});
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    // Clear etaUtc if atDestAirport is checked
    if (name === 'atDestAirport' && checked) {
      setFormData(prev => ({ ...prev, etaUtc: '' }));
      
      // Clear etaUtc validation error if it exists
      if (validationErrors.etaUtc) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.etaUtc;
          return newErrors;
        });
      }
    }
  };

  const resetForm = (initialData: ServiceOrderData) => {
    setFormData(initialData);
    setValidationErrors({});
  };

  return {
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    calendarOpen,
    setCalendarOpen,
    handleInputChange,
    handleDefectTypeChange,
    handleCheckboxChange,
    resetForm
  };
};
