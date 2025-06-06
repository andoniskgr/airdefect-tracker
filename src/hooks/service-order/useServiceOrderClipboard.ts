
import { format } from "date-fns";
import { toast } from "sonner";
import { ServiceOrderData } from "@/components/service-order/types";
import { Aircraft } from "@/types/aircraft";

export const useServiceOrderClipboard = () => {
  const generateFormattedText = (formData: ServiceOrderData, selectedAircraft: Aircraft | undefined): string => {
    // Add "SX-" prefix to aircraft registration
    const aircraftWithPrefix = `SX-${formData.aircraft}`;
    
    let formattedText = '';
    
    if (formData.defectType === "PIREP") {
      formattedText = `A/C DETAILS:
${aircraftWithPrefix} (Aircraft Type: ${selectedAircraft?.type || 'N/A'}, MSN: ${selectedAircraft?.msn || 'N/A'}, ENG TYPE: ${selectedAircraft?.engine || 'N/A'}), FLT No ${formData.flight} (${formData.from}-${formData.to}), ${formData.atDestAirport 
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
      formattedText = `A/C DETAILS:
${aircraftWithPrefix} (Aircraft Type: ${selectedAircraft?.type || 'N/A'}, MSN: ${selectedAircraft?.msn || 'N/A'}, ENG TYPE: ${selectedAircraft?.engine || 'N/A'}), FLT No ${formData.flight} (${formData.from}-${formData.to}), ${formData.atDestAirport 
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

    return formattedText;
  };

  const copyToClipboard = (text: string): Promise<void> => {
    return navigator.clipboard.writeText(text.trim())
      .then(() => {
        toast.success("Service order copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast.error("Failed to copy to clipboard. Please copy manually.");
      });
  };

  return {
    generateFormattedText,
    copyToClipboard
  };
};
