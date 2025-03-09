
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useServiceOrderForm } from "../hooks/useServiceOrderForm";
import ServiceOrderForm from "../components/service-order/ServiceOrderForm";
import { Toaster } from "sonner";

const ServiceOrder = () => {
  const { currentUser } = useAuth();
  
  const {
    formData,
    validationErrors,
    calendarOpen,
    setCalendarOpen,
    handleInputChange,
    handleDefectTypeChange,
    handleCheckboxChange,
    handlePrepareAndCopy,
    handleClear
  } = useServiceOrderForm();

  return (
    <div className="min-h-screen bg-slate-700 text-white p-1">
      <Toaster position="top-right" />
      <div className="container mx-auto max-w-4xl">
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
