
import { ServiceOrderData } from "@/components/service-order/types";
import { toast } from "sonner";

export const useServiceOrderValidation = () => {
  const validate = (
    formData: ServiceOrderData,
    validationErrors: Record<string, boolean>,
    setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  ): boolean => {
    // Check required fields based on defect type
    const commonRequiredFields = ['aircraft', 'flight', 'from', 'to', 'date'];
    let requiredFields: string[] = [];
    
    if (formData.defectType === 'PIREP') {
      requiredFields = [...commonRequiredFields, 'defectDescription'];
      // etaUtc is required only if atDestAirport is false
      if (!formData.atDestAirport) {
        requiredFields.push('etaUtc');
      }
    } else {
      requiredFields = [...commonRequiredFields, 'mel', 'melDescription'];
    }
    
    let isValid = true;
    let newValidationErrors: Record<string, boolean> = {};
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof ServiceOrderData]) {
        isValid = false;
        newValidationErrors[field] = true;
      }
    });
    
    setValidationErrors(newValidationErrors);
    
    if (!isValid) {
      toast.error(`Please fill in all required fields.`);
    }
    
    return isValid;
  };

  return {
    validate
  };
};
