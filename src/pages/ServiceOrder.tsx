
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useServiceOrderForm } from "../hooks/useServiceOrderForm";
import ServiceOrderForm from "../components/service-order/ServiceOrderForm";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";

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

  const handleCopyForTeams = () => {
    // Prepare data in a tabular format suitable for Microsoft Teams
    const { aircraft, from, to, defectDescription, etaUtc, date } = formData;
    
    // Format the current time
    const currentTime = format(new Date(), "HH:mm");
    
    // Create a tabular text (Teams supports basic markdown tables)
    const teamsText = `| TIME | REG | STA | DEFECT | ETA | STD |
| ---- | --- | --- | ------ | --- | --- |
| ${currentTime} | ${aircraft} | ${from} | ${defectDescription} | ${etaUtc || 'N/A'} | ${to} |`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(teamsText)
      .then(() => {
        toast.success("Table format copied for Microsoft Teams!");
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast.error("Failed to copy to clipboard. Please copy manually.");
      });
  };

  return (
    <div className="min-h-screen bg-slate-700 text-white p-0 w-full" style={{ margin: 0, maxWidth: '100%' }}>
      <Toaster position="top-right" />
      <div className="w-full max-w-full px-2" style={{ margin: 0 }}>
        <div className="flex justify-end mb-4 pt-4 pr-4">
          <Button 
            variant="outline" 
            onClick={handleCopyForTeams}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <MessageSquare className="mr-2" />
            Copy for Teams
          </Button>
        </div>
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
