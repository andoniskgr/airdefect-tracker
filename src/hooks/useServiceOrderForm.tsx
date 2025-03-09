
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ServiceOrderData, DefectType } from "../components/service-order/types";

export const useServiceOrderForm = () => {
  // State for form fields
  const [formData, setFormData] = useState<ServiceOrderData>({
    defectType: "PIREP", // PIREP DEFECT selected by default
    aircraft: "",
    flight: "",
    from: "",
    to: "",
    date: new Date(),
    etaUtc: "",
    atDestAirport: false,
    defectDescription: "",
    mel: "",
    melDescription: "",
    preparedText: ""
  });

  // Calendar state
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
  };

  const handleDefectTypeChange = (value: DefectType) => {
    setFormData(prev => ({ ...prev, defectType: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    // Clear etaUtc if atDestAirport is checked
    if (name === 'atDestAirport' && checked) {
      setFormData(prev => ({ ...prev, etaUtc: '' }));
    }
  };

  const validate = (): boolean => {
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
    let missingFields: string[] = [];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof ServiceOrderData]) {
        isValid = false;
        missingFields.push(field);
      }
    });
    
    if (!isValid) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
    }
    
    return isValid;
  };

  const handlePrepareAndCopy = () => {
    if (!validate()) {
      return;
    }
    
    let formattedText = '';
    
    if (formData.defectType === "PIREP") {
      // Generate PIREP DEFECT format
      formattedText = `A/C DETAILS:
${formData.aircraft} (Aircraft Type: A321-231, MSN: 1234, ENG TYPE: IAE V2500), FLT No ${formData.flight} (${formData.from}-${formData.to}), ${formData.atDestAirport 
  ? "A/C already landed to destination airport." 
  : `ETA:${format(formData.date, 'dd/MM/yyyy')}, ${formData.etaUtc} UTC.`}

DEFECT DETAILS:
Pilot reported: ${formData.defectDescription}. Please attend the A/C and perform inspection IAW AMM.

NOTE:
By receiving the attached training material and along with the CRS, you confirm knowledge of the operator's processes and procedures.

INFO:
Pls raise a new workorder in the Tech Log in order to record any maintenance action and close the workorder.
Upon completion, please leave the white original workorder page in the Tech log and fax the green workorder copy back to Athens MCC before a/c departure.

AIRCRAFT MANUALS
Access to manuals is made by AirnavX using the link : https://extranet.aegeanair.com Username and password are provided by MCC.`;
    } else {
      // Generate MAINT ACTION format
      formattedText = `A/C DETAILS:
${formData.aircraft} (Aircraft Type: A321-231, MSN: 1234, ENG TYPE: IAE V2500), FLT No ${formData.flight} (${formData.from}-${formData.to}), ${formData.atDestAirport 
  ? "A/C already landed to destination airport." 
  : `ETA:${format(formData.date, 'dd/MM/yyyy')}, ${formData.etaUtc} UTC.`}

DEFECT DETAILS:
A/C released IAW: ${formData.mel} (${formData.melDescription}). Please perform the necessary maintenance action iaw attached maintenance procedure before A/C departure.

NOTE:
By receiving the attached training material and along with the CRS, you confirm knowledge of the operator's processes and procedures.

INFO:
Pls raise a new workorder in the Tech Log in order to record any maintenance action and close the workorder.
Upon completion, please leave the white original workorder page in the Tech log and fax the green workorder copy back to Athens MCC before a/c departure.

AIRCRAFT MANUALS
Access to manuals is made by AirnavX using the link : https://extranet.aegeanair.com Username and password are provided by MCC.`;
    }

    // Set the prepared text in the form
    setFormData(prev => ({ ...prev, preparedText: formattedText }));
    
    // Copy to clipboard
    navigator.clipboard.writeText(formattedText.trim())
      .then(() => {
        toast.success("Service order copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast.error("Failed to copy to clipboard. Please copy manually.");
      });
  };

  const handleClear = () => {
    setFormData({
      defectType: "PIREP",
      aircraft: "",
      flight: "",
      from: "",
      to: "",
      date: new Date(),
      etaUtc: "",
      atDestAirport: false,
      defectDescription: "",
      mel: "",
      melDescription: "",
      preparedText: ""
    });
  };

  return {
    formData,
    calendarOpen,
    setCalendarOpen,
    handleInputChange,
    handleDefectTypeChange,
    handleCheckboxChange,
    handlePrepareAndCopy,
    handleClear
  };
};
