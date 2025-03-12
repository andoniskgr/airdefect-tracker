import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { DefectRecord } from './DefectRecord.types';
import { TimePicker } from '@/components/ui/time-picker';

interface AddDefectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: Omit<DefectRecord, 'id'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<DefectRecord, 'id'>>>;
  handleClear: () => void;
  handleSubmit: () => void;
}

export const AddDefectModal = ({ 
  isOpen, 
  onOpenChange, 
  formData, 
  setFormData,
  handleClear,
  handleSubmit
}: AddDefectModalProps) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const registrationRef = useRef<HTMLInputElement>(null);
  const stationRef = useRef<HTMLInputElement>(null);
  const defectRef = useRef<HTMLInputElement>(null);
  const remarksRef = useRef<HTMLInputElement>(null);

  const validateField = (field: string, value: string): boolean => {
    if (['registration', 'station', 'defect'].includes(field) && !value) {
      return false;
    }
    if (['registration', 'station'].includes(field) && value.length > 6) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        handleClear();
      }, 50);
      
      const focusInterval = setInterval(() => {
        if (registrationRef.current) {
          registrationRef.current.focus();
          clearInterval(focusInterval);
        }
      }, 100);
      
      setTimeout(() => clearInterval(focusInterval), 2000);
      
      return () => clearInterval(focusInterval);
    }
  }, [isOpen]);

  const handleFieldChange = (field: keyof Omit<DefectRecord, 'id'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (typeof value === 'string') {
      const isValid = validateField(field as string, value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: !isValid
      }));
    }
  };

  const handleEnterOnField = (fieldName: string) => {
    switch(fieldName) {
      case 'registration':
        stationRef.current?.focus();
        break;
      case 'station':
        defectRef.current?.focus();
        break;
      case 'defect':
        remarksRef.current?.focus();
        break;
      case 'remarks':
        validateAndSubmit();
        break;
      default:
        break;
    }
  };

  const validateAndSubmit = () => {
    const requiredFields = ['registration', 'station', 'defect'];
    const errors: Record<string, boolean> = {};
    let hasErrors = false;

    requiredFields.forEach((field) => {
      const value = formData[field as keyof Omit<DefectRecord, 'id'>] as string;
      const isValid = validateField(field, value);
      errors[field] = !isValid;
      if (!isValid) hasErrors = true;
    });

    setValidationErrors(errors);

    if (!hasErrors) {
      handleSubmit();
    } else {
      for (const field of requiredFields) {
        if (errors[field]) {
          if (field === 'registration') registrationRef.current?.focus();
          else if (field === 'station') stationRef.current?.focus();
          else if (field === 'defect') defectRef.current?.focus();
          break;
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnterOnField(fieldName);
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened, registration ref exists:", !!registrationRef.current);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => {
        e.preventDefault();
        setTimeout(() => registrationRef.current?.focus(), 50);
      }}>
        <DialogHeader>
          <DialogTitle className="text-2xl uppercase">Record Aircraft Defect</DialogTitle>
          <DialogDescription className="sr-only">
            Enter defect details below
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">Date</label>
              <div className="relative">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[160px] justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      {formData.date ? format(new Date(formData.date), "dd/MM/yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          handleFieldChange('date', format(date, 'yyyy-MM-dd'));
                          setCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">Time</label>
              <TimePicker
                value={formData.time}
                onChange={(value) => handleFieldChange('time', value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">Registration</label>
              <Input
                ref={registrationRef}
                value={formData.registration}
                onChange={(e) => handleFieldChange('registration', e.target.value.toUpperCase().slice(0, 6))}
                onKeyDown={(e) => handleKeyDown(e, 'registration')}
                placeholder="REGISTRATION"
                className={cn(
                  "text-lg uppercase w-[120px]",
                  validationErrors.registration && "bg-red-50 border-red-200 focus-visible:ring-red-300"
                )}
                maxLength={6}
                autoFocus={true}
              />
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">Station</label>
              <Input
                ref={stationRef}
                value={formData.station}
                onChange={(e) => handleFieldChange('station', e.target.value.toUpperCase().slice(0, 6))}
                onKeyDown={(e) => handleKeyDown(e, 'station')}
                placeholder="STATION"
                className={cn(
                  "text-lg uppercase w-[120px]",
                  validationErrors.station && "bg-red-50 border-red-200 focus-visible:ring-red-300"
                )}
                maxLength={6}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">ETA</label>
              <TimePicker
                value={formData.eta}
                onChange={(value) => handleFieldChange('eta', value)}
                onEnterPress={() => stationRef.current?.focus()}
              />
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">STD</label>
              <TimePicker
                value={formData.std}
                onChange={(value) => handleFieldChange('std', value)}
                onEnterPress={() => defectRef.current?.focus()}
              />
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">UPD</label>
              <TimePicker
                value={formData.upd}
                onChange={(value) => handleFieldChange('upd', value)}
                onEnterPress={() => defectRef.current?.focus()}
              />
            </div>
          </div>
          <div>
            <label className="text-lg font-medium mb-1 block uppercase">Defect Description</label>
            <Input
              ref={defectRef}
              value={formData.defect}
              onChange={(e) => handleFieldChange('defect', e.target.value.toUpperCase())}
              onKeyDown={(e) => handleKeyDown(e, 'defect')}
              placeholder="DESCRIPTION"
              className={cn(
                "text-lg uppercase",
                validationErrors.defect && "bg-red-50 border-red-200 focus-visible:ring-red-300"
              )}
            />
          </div>
          <div>
            <label className="text-lg font-medium mb-1 block uppercase">Remarks</label>
            <Input
              ref={remarksRef}
              value={formData.remarks}
              onChange={(e) => handleFieldChange('remarks', e.target.value.toUpperCase())}
              onKeyDown={(e) => handleKeyDown(e, 'remarks')}
              placeholder="REMARKS"
              className="text-lg uppercase"
            />
          </div>
          <div className="flex justify-center space-x-6 mt-2">
            <div className="flex flex-col items-center space-y-1">
              <Checkbox
                id="sl"
                checked={formData.sl}
                onCheckedChange={(checked) => 
                  handleFieldChange('sl', checked as boolean)
                }
                className="h-5 w-5"
              />
              <label htmlFor="sl" className="text-lg font-medium uppercase">
                SL
              </label>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Checkbox
                id="rst"
                checked={formData.rst}
                onCheckedChange={(checked) => 
                  handleFieldChange('rst', checked as boolean)
                }
                className="h-5 w-5"
              />
              <label htmlFor="rst" className="text-lg font-medium uppercase">
                RST
              </label>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Checkbox
                id="pln"
                checked={formData.pln}
                onCheckedChange={(checked) => 
                  handleFieldChange('pln', checked as boolean)
                }
                className="h-5 w-5"
              />
              <label htmlFor="pln" className="text-lg font-medium uppercase">
                PLN
              </label>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Checkbox
                id="ok"
                checked={formData.ok}
                onCheckedChange={(checked) => 
                  handleFieldChange('ok', checked as boolean)
                }
                className="h-5 w-5"
              />
              <label htmlFor="ok" className="text-lg font-medium uppercase">
                OK
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={handleClear} className="text-lg uppercase">
            Clear
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => onOpenChange(false)}
            className="text-lg uppercase"
          >
            Cancel
          </Button>
          <Button 
            onClick={validateAndSubmit} 
            className="bg-green-600 text-white hover:bg-green-700 text-lg uppercase"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
