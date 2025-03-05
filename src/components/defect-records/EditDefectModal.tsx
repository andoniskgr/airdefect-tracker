import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from 'date-fns';
import { cn } from "@/lib/utils";
import { DefectRecord } from './DefectRecord.types';
import { TimePicker } from '@/components/ui/time-picker';

interface EditDefectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingRecord: DefectRecord | null;
  setEditingRecord: React.Dispatch<React.SetStateAction<DefectRecord | null>>;
  handleEditSubmit: () => void;
}

export const EditDefectModal = ({ 
  isOpen, 
  onOpenChange,
  editingRecord, 
  setEditingRecord,
  handleEditSubmit
}: EditDefectModalProps) => {
  if (!editingRecord) return null;

  // Log record ID for debugging
  console.log("EditDefectModal rendering with record ID:", editingRecord.id);

  // Format audit timestamps if they exist
  const createdAtFormatted = editingRecord.createdAt ? 
    format(parseISO(editingRecord.createdAt), 'dd/MM/yyyy HH:mm:ss') : 'N/A';
    
  const updatedAtFormatted = editingRecord.updatedAt ? 
    format(parseISO(editingRecord.updatedAt), 'dd/MM/yyyy HH:mm:ss') : 'N/A';

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
              <TimePicker
                value={editingRecord.time}
                onChange={(value) => setEditingRecord({...editingRecord, time: value})}
              />
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
              <TimePicker
                value={editingRecord.eta}
                onChange={(value) => setEditingRecord({...editingRecord, eta: value})}
              />
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">STD</label>
              <TimePicker
                value={editingRecord.std}
                onChange={(value) => setEditingRecord({...editingRecord, std: value})}
              />
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">UPD</label>
              <TimePicker
                value={editingRecord.upd}
                onChange={(value) => setEditingRecord({...editingRecord, upd: value})}
              />
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
        <div className="border-t pt-4 mt-2">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Record History</h3>
          {editingRecord.createdBy && (
            <p className="text-xs text-gray-500">
              Created by: {editingRecord.createdBy} at {createdAtFormatted}
            </p>
          )}
          {editingRecord.updatedBy && editingRecord.updatedAt !== editingRecord.createdAt && (
            <p className="text-xs text-gray-500">
              Last updated by: {editingRecord.updatedBy} at {updatedAtFormatted}
            </p>
          )}
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
            onClick={() => {
              console.log("Update button clicked, sending record with ID:", editingRecord.id);
              handleEditSubmit();
            }} 
            className="bg-green-600 text-white hover:bg-green-700 text-lg uppercase"
          >
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
