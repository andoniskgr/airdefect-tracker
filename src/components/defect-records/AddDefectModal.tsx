
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DefectRecord } from './DefectRecord.types';
import { DateTimeSection } from './form-components/DateTimeSection';
import { RegistrationStationSection } from './form-components/RegistrationStationSection';
import { TimingSection } from './form-components/TimingSection';
import { DescriptionSection } from './form-components/DescriptionSection';
import { CheckboxGroup } from './form-components/CheckboxGroup';
import { ActionButtons } from './form-components/ActionButtons';
import { useDefectValidation } from '@/hooks/defect-records/useDefectValidation';
import { useDefectKeyboardNavigation } from '@/hooks/defect-records/useDefectKeyboardNavigation';

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
  const registrationRef = useRef<HTMLInputElement>(null);
  const stationRef = useRef<HTMLInputElement>(null);
  const defectRef = useRef<HTMLInputElement>(null);
  const remarksRef = useRef<HTMLInputElement>(null);
  
  const { validationErrors, setValidationErrors, validateField, validateForm } = useDefectValidation();
  const [initialRender, setInitialRender] = useState(true);

  const validateAndSubmit = () => {
    const { hasErrors, errors } = validateForm(formData);
    
    if (!hasErrors) {
      handleSubmit();
    } else {
      // Focus on the first field with an error
      if (errors.registration) registrationRef.current?.focus();
      else if (errors.station) stationRef.current?.focus();
      else if (errors.defect) defectRef.current?.focus();
    }
  };

  const { handleKeyDown } = useDefectKeyboardNavigation({
    refs: { registrationRef, stationRef, defectRef, remarksRef },
    validateAndSubmit
  });

  const handleFieldChange = (field: keyof Omit<DefectRecord, 'id'>, value: any) => {
    console.log(`Field ${field} changing to:`, value);
    
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('Updated form data:', updated);
      return updated;
    });
    
    if (typeof value === 'string') {
      const isValid = validateField(field as string, value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: !isValid
      }));
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && !initialRender) {
      console.log('Modal opened, resetting form');
      handleClear();
    } else if (isOpen) {
      setInitialRender(false);
    }
  }, [isOpen, handleClear, initialRender]);

  // Focus registration field when modal opens
  useEffect(() => {
    if (isOpen) {
      const focusInterval = setInterval(() => {
        if (registrationRef.current) {
          registrationRef.current.focus();
          console.log('Registration field focused');
          clearInterval(focusInterval);
        } else {
          console.log('Registration ref not available yet');
        }
      }, 100);
      
      return () => clearInterval(focusInterval);
    }
  }, [isOpen]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          // Only reset validation errors when closing
          setValidationErrors({});
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => {
        e.preventDefault();
        setTimeout(() => {
          if (registrationRef.current) {
            registrationRef.current.focus();
            console.log('Focus set on registration input via onOpenAutoFocus');
          }
        }, 100);
      }}>
        <DialogHeader>
          <DialogTitle className="text-2xl uppercase">Record Aircraft Defect</DialogTitle>
          <DialogDescription className="sr-only">
            Enter defect details below
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <DateTimeSection 
            date={formData.date} 
            time={formData.time}
            onDateChange={(value) => handleFieldChange('date', value)}
            onTimeChange={(value) => handleFieldChange('time', value)}
          />
          
          <RegistrationStationSection 
            registration={formData.registration}
            station={formData.station}
            onRegistrationChange={(value) => handleFieldChange('registration', value)}
            onStationChange={(value) => handleFieldChange('station', value)}
            registrationRef={registrationRef}
            stationRef={stationRef}
            validationErrors={validationErrors}
            handleKeyDown={handleKeyDown}
          />
          
          <TimingSection 
            eta={formData.eta}
            std={formData.std}
            upd={formData.upd}
            onEtaChange={(value) => handleFieldChange('eta', value)}
            onStdChange={(value) => handleFieldChange('std', value)}
            onUpdChange={(value) => handleFieldChange('upd', value)}
            onEnterPressStd={() => stationRef.current?.focus()}
            onEnterPressUpd={() => defectRef.current?.focus()}
          />
          
          <DescriptionSection 
            defect={formData.defect}
            remarks={formData.remarks}
            onDefectChange={(value) => handleFieldChange('defect', value)}
            onRemarksChange={(value) => handleFieldChange('remarks', value)}
            defectRef={defectRef}
            remarksRef={remarksRef}
            validationErrors={validationErrors}
            handleKeyDown={handleKeyDown}
          />
          
          <CheckboxGroup 
            values={{
              nxs: formData.nxs,
              rst: formData.rst,
              dly: formData.dly,
              pln: formData.pln,
              sl: formData.sl,
              ok: formData.ok
            }}
            onCheckedChange={(field, checked) => handleFieldChange(field, checked)}
          />
        </div>
        <ActionButtons 
          onClear={handleClear}
          onCancel={() => onOpenChange(false)}
          onSave={validateAndSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};
