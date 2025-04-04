
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DefectRecord } from './DefectRecord.types';
import { format, parseISO } from 'date-fns';
import { DateTimeSection } from './form-components/DateTimeSection';
import { RegistrationStationSection } from './form-components/RegistrationStationSection';
import { TimingSection } from './form-components/TimingSection';
import { DescriptionSection } from './form-components/DescriptionSection';
import { CheckboxGroup } from './form-components/CheckboxGroup';
import { RecordHistory } from './form-components/RecordHistory';
import { EditActionButtons } from './form-components/EditActionButtons';
import { useRef } from 'react';

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

  const registrationRef = useRef<HTMLInputElement>(null);
  const stationRef = useRef<HTMLInputElement>(null);
  const defectRef = useRef<HTMLInputElement>(null);
  const remarksRef = useRef<HTMLInputElement>(null);

  // Create a simpler handler with direct field updates
  const handleFieldChange = (field: keyof DefectRecord, value: any) => {
    console.log(`Updating ${field} to:`, value);
    setEditingRecord(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleUpdateClick = () => {
    console.log("Update button clicked, sending record with ID:", editingRecord.id);
    handleEditSubmit();
  };

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
          <DateTimeSection 
            date={editingRecord.date} 
            time={editingRecord.time}
            onDateChange={(value) => handleFieldChange('date', value)}
            onTimeChange={(value) => handleFieldChange('time', value)}
          />
          
          <RegistrationStationSection 
            registration={editingRecord.registration}
            station={editingRecord.station}
            onRegistrationChange={(value) => handleFieldChange('registration', value)}
            onStationChange={(value) => handleFieldChange('station', value)}
            registrationRef={registrationRef}
            stationRef={stationRef}
            validationErrors={{}}
            handleKeyDown={() => {}}
          />
          
          <TimingSection 
            eta={editingRecord.eta}
            std={editingRecord.std}
            upd={editingRecord.upd}
            onEtaChange={(value) => handleFieldChange('eta', value)}
            onStdChange={(value) => handleFieldChange('std', value)}
            onUpdChange={(value) => handleFieldChange('upd', value)}
          />
          
          <DescriptionSection 
            defect={editingRecord.defect}
            remarks={editingRecord.remarks}
            onDefectChange={(value) => handleFieldChange('defect', value)}
            onRemarksChange={(value) => handleFieldChange('remarks', value)}
            defectRef={defectRef}
            remarksRef={remarksRef}
            validationErrors={{}}
            handleKeyDown={() => {}}
          />
          
          <CheckboxGroup 
            values={{
              nxs: editingRecord.nxs,
              rst: editingRecord.rst,
              dly: editingRecord.dly,
              pln: editingRecord.pln,
              sl: editingRecord.sl,
              ok: editingRecord.ok
            }}
            onCheckedChange={(field, checked) => handleFieldChange(field, checked)}
          />
        </div>
        
        <RecordHistory 
          createdBy={editingRecord.createdBy}
          createdAt={editingRecord.createdAt}
          updatedBy={editingRecord.updatedBy}
          updatedAt={editingRecord.updatedAt}
        />
        
        <EditActionButtons
          onCancel={() => onOpenChange(false)}
          onUpdate={handleUpdateClick}
        />
      </DialogContent>
    </Dialog>
  );
};
