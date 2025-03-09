
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useServiceOrderForm } from "../hooks/useServiceOrderForm";
import ServiceOrderForm from "../components/service-order/ServiceOrderForm";

const ServiceOrder = () => {
  const { currentUser } = useAuth();
  
  const {
    formData,
    calendarOpen,
    setCalendarOpen,
    handleInputChange,
    handleDefectTypeChange,
    handleCheckboxChange,
    handlePrepareAndCopy,
    handleClear
  } = useServiceOrderForm();

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="container mx-auto max-w-4xl">
        <ServiceOrderForm 
          formData={formData}
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
