import { useState } from "react";
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
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDefectTypeChange = (value: DefectType) => {
    setFormData(prev => ({ ...prev, defectType: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePrepareAndCopy = () => {
    let formattedText = '';
    
    if (formData.defectType === "PIREP") {
      // Generate PIREP DEFECT format
      formattedText = `A/C DETAILS:
${formData.aircraft} (Aircraft Type: A321-231, MSN: 1234, ENG TYPE: IAE V2500), FLT No ${formData.flight} (${formData.from}-${formData.to}), ETA:${format(formData.date, 'dd/MM/yyyy')}, ${formData.etaUtc} UTC.

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
      // Generate MAINT ACTION format - keeping simple format for now as not specified
      formattedText = `
Aircraft: ${formData.aircraft}
Flight: ${formData.flight}
Route: ${formData.from} - ${formData.to}
Date: ${format(formData.date, 'dd/MM/yyyy')}
ETA UTC: ${formData.etaUtc}
${formData.atDestAirport ? 'At Destination Airport' : ''}
${formData.defectType === "MAINT" ? 'MAINT. ACTION' : ''}

Defect Description:
${formData.defectDescription}
      `;
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
