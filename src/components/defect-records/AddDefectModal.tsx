
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
              <TimePicker
                value={formData.time}
                onChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
              />
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
              <TimePicker
                value={formData.eta}
                onChange={(value) => setFormData(prev => ({ ...prev, eta: value }))}
              />
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">STD</label>
              <TimePicker
                value={formData.std}
                onChange={(value) => setFormData(prev => ({ ...prev, std: value }))}
              />
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">UPD</label>
              <TimePicker
                value={formData.upd}
                onChange={(value) => setFormData(prev => ({ ...prev, upd: value }))}
              />
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
