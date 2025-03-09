
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ServiceOrderData } from "../components/service-order/types";

export const useServiceOrderForm = () => {
  // State for form fields
  const [formData, setFormData] = useState<ServiceOrderData>({
    defectType: "PIREP", // PIREP DEFECT selected by default
    maintenanceAction: false,
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

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePrepareAndCopy = () => {
    // Create formatted text for clipboard
    const formattedText = `
Aircraft: ${formData.aircraft}
Flight: ${formData.flight}
Route: ${formData.from} - ${formData.to}
Date: ${format(formData.date, 'dd/MM/yyyy')}
ETA UTC: ${formData.etaUtc}
${formData.atDestAirport ? 'At Destination Airport' : ''}
${formData.defectType} ${formData.maintenanceAction ? '/ MAINT. ACTION' : ''}

Defect Description:
${formData.defectDescription}

${formData.preparedText}
    `;

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
      maintenanceAction: false,
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
    handleCheckboxChange,
    handlePrepareAndCopy,
    handleClear
  };
};
