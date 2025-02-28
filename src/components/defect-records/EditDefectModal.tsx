
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

interface EditDefectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingRecord: DefectRecord | null;
  setEditingRecord: React.Dispatch<React.SetStateAction<DefectRecord | null>>;
  timeInput: string;
  setTimeInput: React.Dispatch<React.SetStateAction<string>>;
  etaTimeInput: string;
  setEtaTimeInput: React.Dispatch<React.SetStateAction<string>>;
  stdTimeInput: string;
  setStdTimeInput: React.Dispatch<React.SetStateAction<string>>;
  updTimeInput: string;
  setUpdTimeInput: React.Dispatch<React.SetStateAction<string>>;
  handleEditingTimeChange: (field: string, value: string) => void;
  handleEditSubmit: () => void;
}

export const EditDefectModal = ({ 
  isOpen, 
  onOpenChange,
  editingRecord, 
  setEditingRecord,
  timeInput,
  setTimeInput,
  etaTimeInput,
  setEtaTimeInput,
  stdTimeInput,
  setStdTimeInput,
  updTimeInput,
  setUpdTimeInput,
  handleEditingTimeChange,
  handleEditSubmit
}: EditDefectModalProps) => {
  if (!editingRecord) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl uppercase">Edit Defect Record</DialogTitle>
          <DialogDescription className="sr-only">
            Edit defect details below
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
                        !editingRecord.date && "text-muted-foreground"
                      )}
                    >
                      {editingRecord.date ? format(new Date(editingRecord.date), "dd/MM/yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editingRecord.date ? new Date(editingRecord.date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setEditingRecord({
                            ...editingRecord,
                            date: format(date, 'yyyy-MM-dd')
                          });
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
                  onChange={(e) => handleEditingTimeChange('time', e.target.value)}
                  placeholder="HH:MM"
                  className="text-lg uppercase w-[120px]"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3"
                  onClick={() => {
                    const now = new Date();
                    const timeStr = format(now, 'HH:mm');
                    setTimeInput(timeStr);
                    setEditingRecord({...editingRecord, time: timeStr});
                  }}
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
                value={editingRecord.registration}
                onChange={(e) => setEditingRecord({
                  ...editingRecord, 
                  registration: e.target.value.toUpperCase().slice(0, 6)
                })}
                placeholder="REGISTRATION"
                className="text-lg uppercase w-[120px]"
                maxLength={6}
              />
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">Station</label>
              <Input
                value={editingRecord.station}
                onChange={(e) => setEditingRecord({
                  ...editingRecord, 
                  station: e.target.value.toUpperCase().slice(0, 6)
                })}
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
                  onChange={(e) => handleEditingTimeChange('eta', e.target.value)}
                  placeholder="HH:MM"
                  className="text-lg uppercase w-full"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3"
                  onClick={() => {
                    const now = new Date();
                    const timeStr = format(now, 'HH:mm');
                    setEtaTimeInput(timeStr);
                    setEditingRecord({...editingRecord, eta: timeStr});
                  }}
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
                  onChange={(e) => handleEditingTimeChange('std', e.target.value)}
                  placeholder="HH:MM"
                  className="text-lg uppercase w-full"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3"
                  onClick={() => {
                    const now = new Date();
                    const timeStr = format(now, 'HH:mm');
                    setStdTimeInput(timeStr);
                    setEditingRecord({...editingRecord, std: timeStr});
                  }}
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
                  onChange={(e) => handleEditingTimeChange('upd', e.target.value)}
                  placeholder="HH:MM"
                  className="text-lg uppercase w-full"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-3"
                  onClick={() => {
                    const now = new Date();
                    const timeStr = format(now, 'HH:mm');
                    setUpdTimeInput(timeStr);
                    setEditingRecord({...editingRecord, upd: timeStr});
                  }}
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
              value={editingRecord.defect}
              onChange={(e) => setEditingRecord({
                ...editingRecord, 
                defect: e.target.value.toUpperCase()
              })}
              placeholder="DESCRIPTION"
              className="text-lg uppercase"
            />
          </div>
          <div>
            <label className="text-lg font-medium mb-1 block uppercase">Remarks</label>
            <Input
              value={editingRecord.remarks}
              onChange={(e) => setEditingRecord({
                ...editingRecord, 
                remarks: e.target.value.toUpperCase()
              })}
              placeholder="REMARKS"
              className="text-lg uppercase"
            />
          </div>
          <div className="flex justify-center space-x-6 mt-2">
            <div className="flex flex-col items-center space-y-1">
              <Checkbox
                id="edit-sl"
                checked={editingRecord.sl}
                onCheckedChange={(checked) => 
                  setEditingRecord({
                    ...editingRecord, 
                    sl: checked as boolean
                  })
                }
                className="h-5 w-5"
              />
              <label htmlFor="edit-sl" className="text-lg font-medium uppercase">
                SL
              </label>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Checkbox
                id="edit-rst"
                checked={editingRecord.rst}
                onCheckedChange={(checked) => 
                  setEditingRecord({
                    ...editingRecord, 
                    rst: checked as boolean
                  })
                }
                className="h-5 w-5"
              />
              <label htmlFor="edit-rst" className="text-lg font-medium uppercase">
                RST
              </label>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Checkbox
                id="edit-ok"
                checked={editingRecord.ok}
                onCheckedChange={(checked) => 
                  setEditingRecord({
                    ...editingRecord, 
                    ok: checked as boolean
                  })
                }
                className="h-5 w-5"
              />
              <label htmlFor="edit-ok" className="text-lg font-medium uppercase">
                OK
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <Button 
            variant="destructive" 
            onClick={() => onOpenChange(false)}
            className="text-lg uppercase"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            className="bg-green-600 text-white hover:bg-green-700 text-lg uppercase"
          >
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
