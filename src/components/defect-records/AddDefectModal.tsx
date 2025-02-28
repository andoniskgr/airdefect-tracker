
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { DefectRecord } from './DefectRecord.types';

// Define a Clock component
const Clock = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

interface AddDefectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: Omit<DefectRecord, 'id'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<DefectRecord, 'id'>>>;
  timeInput: string;
  setTimeInput: React.Dispatch<React.SetStateAction<string>>;
  etaTimeInput: string;
  setEtaTimeInput: React.Dispatch<React.SetStateAction<string>>;
  stdTimeInput: string;
  setStdTimeInput: React.Dispatch<React.SetStateAction<string>>;
  updTimeInput: string;
  setUpdTimeInput: React.Dispatch<React.SetStateAction<string>>;
  handleTimeChange: (field: string, value: string) => void;
  openTimePicker: (field: string) => void;
  handleClear: () => void;
  handleSubmit: () => void;
}

export const AddDefectModal = ({ 
  isOpen, 
  onOpenChange, 
  formData, 
  setFormData,
  timeInput,
  setTimeInput,
  etaTimeInput,
  setEtaTimeInput,
  stdTimeInput,
  setStdTimeInput,
  updTimeInput,
  setUpdTimeInput,
  handleTimeChange,
  openTimePicker,
  handleClear,
  handleSubmit
}: AddDefectModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
                <Popover>
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
                          setFormData({ ...formData, date: format(date, 'yyyy-MM-dd') });
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
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={timeInput}
                  onChange={(e) => handleTimeChange('time', e.target.value)}
                  placeholder="HH:MM"
                  className="text-lg uppercase w-[120px]"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3"
                  onClick={() => openTimePicker('time')}
                >
                  <span className="sr-only">Set current time</span>
                  <Clock />
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">Registration</label>
              <Input
                value={formData.registration}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  registration: e.target.value.toUpperCase().slice(0, 6)
                }))}
                placeholder="REGISTRATION"
                className="text-lg uppercase w-[120px]"
                maxLength={6}
              />
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">Station</label>
              <Input
                value={formData.station}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  station: e.target.value.toUpperCase().slice(0, 6)
                }))}
                placeholder="STATION"
                className="text-lg uppercase w-[120px]"
                maxLength={6}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">ETA</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={etaTimeInput}
                  onChange={(e) => handleTimeChange('eta', e.target.value)}
                  placeholder="HH:MM"
                  className="text-lg uppercase w-full"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3"
                  onClick={() => openTimePicker('eta')}
                >
                  <span className="sr-only">Set current time</span>
                  <Clock />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">STD</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={stdTimeInput}
                  onChange={(e) => handleTimeChange('std', e.target.value)}
                  placeholder="HH:MM"
                  className="text-lg uppercase w-full"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3"
                  onClick={() => openTimePicker('std')}
                >
                  <span className="sr-only">Set current time</span>
                  <Clock />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">UPD</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={updTimeInput}
                  onChange={(e) => handleTimeChange('upd', e.target.value)}
                  placeholder="HH:MM"
                  className="text-lg uppercase w-full"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3"
                  onClick={() => openTimePicker('upd')}
                >
                  <span className="sr-only">Set current time</span>
                  <Clock />
                </Button>
              </div>
            </div>
          </div>
          <div>
            <label className="text-lg font-medium mb-1 block uppercase">Defect Description</label>
            <Input
              value={formData.defect}
              onChange={(e) => setFormData(prev => ({ ...prev, defect: e.target.value.toUpperCase() }))}
              placeholder="DESCRIPTION"
              className="text-lg uppercase"
            />
          </div>
          <div>
            <label className="text-lg font-medium mb-1 block uppercase">Remarks</label>
            <Input
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value.toUpperCase() }))}
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
                  setFormData(prev => ({ ...prev, sl: checked as boolean }))
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
                  setFormData(prev => ({ ...prev, rst: checked as boolean }))
                }
                className="h-5 w-5"
              />
              <label htmlFor="rst" className="text-lg font-medium uppercase">
                RST
              </label>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Checkbox
                id="ok"
                checked={formData.ok}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, ok: checked as boolean }))
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
            onClick={handleSubmit} 
            className="bg-green-600 text-white hover:bg-green-700 text-lg uppercase"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
