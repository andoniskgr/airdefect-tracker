
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ServiceOrder = () => {
  const { currentUser } = useAuth();
  
  // State for form fields
  const [formData, setFormData] = useState({
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
        alert("Service order copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert("Failed to copy to clipboard. Please copy manually.");
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

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-slate-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-blue-500"></div>
              <span className="font-bold">PIREP DEFECT</span>
            </div>
            
            <div className="flex items-center space-x-2 ml-auto">
              <Checkbox 
                id="maintenanceAction" 
                checked={formData.maintenanceAction} 
                onCheckedChange={(checked) => 
                  handleCheckboxChange('maintenanceAction', checked === true)
                }
              />
              <label htmlFor="maintenanceAction" className="text-white font-medium">
                MAINT. ACTION
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Input 
                type="text" 
                name="aircraft"
                value={formData.aircraft}
                onChange={handleInputChange}
                placeholder="Select A/C" 
                className="bg-white text-black"
              />
            </div>
            
            <div>
              <Input 
                type="text" 
                name="flight"
                value={formData.flight}
                onChange={handleInputChange}
                placeholder="FLIGHT" 
                className="bg-white text-black"
              />
            </div>
            
            <div>
              <Input 
                type="text" 
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                placeholder="FROM" 
                className="bg-white text-black"
              />
            </div>
            
            <div>
              <Input 
                type="text" 
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                placeholder="TO" 
                className="bg-white text-black"
              />
            </div>
            
            <div>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white text-black hover:bg-white/90",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "dd/MM/yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, date }));
                        setCalendarOpen(false);
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Input 
                type="text" 
                name="etaUtc"
                value={formData.etaUtc}
                onChange={handleInputChange}
                placeholder="ETA UTC" 
                className="bg-white text-black"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              id="atDestAirport" 
              checked={formData.atDestAirport} 
              onCheckedChange={(checked) => 
                handleCheckboxChange('atDestAirport', checked === true)
              }
            />
            <label htmlFor="atDestAirport" className="text-white font-medium">
              At Dest. Airport
            </label>
          </div>
          
          <div className="mb-4">
            <Input 
              type="text" 
              name="defectDescription"
              value={formData.defectDescription}
              onChange={handleInputChange}
              placeholder="DEFECT DESCRIPTION" 
              className="bg-white text-black w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Prepared text</label>
            <textarea 
              name="preparedText"
              value={formData.preparedText}
              onChange={handleInputChange}
              className="w-full h-64 p-2 bg-white text-black rounded-md"
              placeholder="Enter prepared text here..."
            />
          </div>
          
          <div className="flex space-x-4 justify-center">
            <Button 
              onClick={handlePrepareAndCopy}
              className="bg-green-600 hover:bg-green-700"
            >
              Prepare & Copy
            </Button>
            <Button 
              onClick={handleClear}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceOrder;
