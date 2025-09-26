import { useRef } from "react";
import { ServiceOrderData } from "@/components/service-order/types";
import { useAircraftData } from "../useAircraftData";
import { useServiceOrderValidation } from "./useServiceOrderValidation";
import { useServiceOrderClipboard } from "./useServiceOrderClipboard";
import { useServiceOrderInputs } from "./useServiceOrderInputs";

// Initial form data
const getInitialFormData = (
  initialAircraft: string = "",
  type: string = ""
): ServiceOrderData => {
  // Determine defect type based on type parameter
  let defectType: "PIREP" | "MAINT" = "PIREP";
  if (type === "mel") {
    defectType = "MAINT";
  }

  return {
    defectType,
    aircraft: initialAircraft,
    flight: "",
    from: "",
    to: "",
    date: new Date(),
    etaUtc: "",
    atDestAirport: false,
    defectDescription: "",
    mel: "",
    melDescription: "",
    preparedText: "",
  };
};

export const useServiceOrderForm = (
  initialAircraft: string = "",
  type: string = ""
) => {
  const { aircraftList } = useAircraftData();
  const { validate } = useServiceOrderValidation();
  const { generateFormattedText, copyToClipboard } = useServiceOrderClipboard();
  const {
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    calendarOpen,
    setCalendarOpen,
    handleInputChange,
    handleDefectTypeChange,
    handleCheckboxChange,
    resetForm,
  } = useServiceOrderInputs(getInitialFormData(initialAircraft, type));

  // References to input fields for focusing
  const fieldsRef = useRef<Record<string, HTMLElement | null>>({});

  const focusFirstInvalidField = () => {
    // Get the first error field name
    const errorFields = Object.keys(validationErrors);
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0];

      // Special handling for date field which uses a button
      if (firstErrorField === "date") {
        setCalendarOpen(true);
        return;
      }

      // Focus the first invalid field
      const element = document.querySelector(
        `[name="${firstErrorField}"]`
      ) as HTMLElement;
      if (element) {
        element.focus();
      }
    }
  };

  const handlePrepareAndCopy = () => {
    if (!validate(formData, validationErrors, setValidationErrors)) {
      setTimeout(focusFirstInvalidField, 100);
      return;
    }

    // Find selected aircraft details
    const selectedAircraft = aircraftList.find(
      (ac) => ac.registration === formData.aircraft
    );

    const formattedText = generateFormattedText(formData, selectedAircraft);

    setFormData((prev) => ({ ...prev, preparedText: formattedText }));

    // Copy to clipboard
    copyToClipboard(formattedText);
  };

  const handleClear = () => {
    resetForm(getInitialFormData(initialAircraft, type));
  };

  return {
    formData,
    validationErrors,
    calendarOpen,
    setCalendarOpen,
    handleInputChange,
    handleDefectTypeChange,
    handleCheckboxChange,
    handlePrepareAndCopy,
    handleClear,
  };
};
