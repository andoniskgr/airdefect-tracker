import React from "react";
import { useAuth } from "../context/AuthContext";
import { useServiceOrderForm } from "../hooks/service-order/useServiceOrderForm";
import ServiceOrderForm from "../components/service-order/ServiceOrderForm";
import { Toaster } from "sonner";
import { useSearchParams } from "react-router-dom";

const ServiceOrder = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const aircraftParam = searchParams.get("aircraft") || "";
  const typeParam = searchParams.get("type") || "";

  const {
    formData,
    validationErrors,
    calendarOpen,
    setCalendarOpen,
    handleInputChange,
    handleDefectTypeChange,
    handleCheckboxChange,
    handlePrepareAndCopy,
    handleClear,
  } = useServiceOrderForm(aircraftParam, typeParam);

  return (
    <div
      className="min-h-screen bg-slate-700 text-white p-0 w-full"
      style={{ margin: 0, maxWidth: "100%" }}
    >
      <Toaster position="top-right" />
      <div className="w-full max-w-full px-2" style={{ margin: 0 }}>
        <ServiceOrderForm
          formData={formData}
          validationErrors={validationErrors}
          calendarOpen={calendarOpen}
          setCalendarOpen={setCalendarOpen}
          handleInputChange={handleInputChange}
          handleDefectTypeChange={handleDefectTypeChange}
          handleCheckboxChange={handleCheckboxChange}
          handlePrepareAndCopy={handlePrepareAndCopy}
          handleClear={handleClear}
        />
      </div>
    </div>
  );
};

export default ServiceOrder;
