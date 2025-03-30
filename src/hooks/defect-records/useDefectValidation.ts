
import { useState } from 'react';

export const useDefectValidation = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string): boolean => {
    if (['registration', 'station', 'defect'].includes(field) && !value) {
      return false;
    }
    if (['registration', 'station'].includes(field) && value.length > 6) {
      return false;
    }
    return true;
  };

  const validateForm = (formData: Record<string, any>) => {
    const requiredFields = ['registration', 'station', 'defect'];
    const errors: Record<string, boolean> = {};
    let hasErrors = false;

    requiredFields.forEach((field) => {
      const value = formData[field] as string;
      const isValid = validateField(field, value);
      errors[field] = !isValid;
      if (!isValid) hasErrors = true;
    });

    setValidationErrors(errors);
    return { hasErrors, errors };
  };

  return {
    validationErrors,
    setValidationErrors,
    validateField,
    validateForm
  };
};
