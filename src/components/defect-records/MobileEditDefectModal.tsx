import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DefectRecord } from "./DefectRecord.types";
import { DateTimeSection } from "./form-components/DateTimeSection";
import { RegistrationStationSection } from "./form-components/RegistrationStationSection";
import { TimingSection } from "./form-components/TimingSection";
import { DescriptionSection } from "./form-components/DescriptionSection";
import { CheckboxGroup } from "./form-components/CheckboxGroup";
import { ActionButtons } from "./form-components/ActionButtons";
import { useDefectValidation } from "@/hooks/defect-records/useDefectValidation";
import { useDefectKeyboardNavigation } from "@/hooks/defect-records/useDefectKeyboardNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMobileFormScrollViewport } from "@/hooks/useMobileFormScrollViewport";
import { cn } from "@/lib/utils";

interface MobileEditDefectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  record: DefectRecord;
  onUpdate: (updatedRecord: DefectRecord) => void;
  onCancel: () => void;
}

export const MobileEditDefectModal = ({
  isOpen,
  onOpenChange,
  record,
  onUpdate,
  onCancel,
}: MobileEditDefectModalProps) => {
  const [formData, setFormData] = useState<DefectRecord>(record);
  const isMobile = useIsMobile();

  const registrationRef = useRef<HTMLInputElement>(null);
  const stationRef = useRef<HTMLInputElement>(null);
  const defectRef = useRef<HTMLInputElement>(null);
  const remarksRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const { validationErrors, setValidationErrors, validateField, validateForm } =
    useDefectValidation();

  const { handleKeyDown } = useDefectKeyboardNavigation({
    refs: { registrationRef, stationRef, defectRef, remarksRef },
    validateAndSubmit: () => {},
  });

  const { bottomInsetPx, maxHeightPx } = useMobileFormScrollViewport(
    isOpen && isMobile,
    mobileScrollRef
  );

  // Update form data when record prop changes
  useEffect(() => {
    setFormData(record);
  }, [record]);

  const handleFieldChange = (field: keyof DefectRecord, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (typeof value === "string") {
      const isValid = validateField(field as string, value);
      setValidationErrors((prev) => ({
        ...prev,
        [field]: !isValid,
      }));
    }
  };

  const validateAndSubmit = () => {
    const { hasErrors, errors } = validateForm(formData);

    if (!hasErrors) {
      onUpdate(formData);
    } else {
      // Focus on the first field with an error
      if (errors.time) timeRef.current?.focus();
      else if (errors.registration) registrationRef.current?.focus();
      else if (errors.station) stationRef.current?.focus();
      else if (errors.defect) defectRef.current?.focus();
    }
  };

  const handleClear = () => {
    setFormData(record); // Reset to original values
    setValidationErrors({});
  };

  const handleCancel = () => {
    setFormData(record); // Reset to original values
    setValidationErrors({});
    onCancel();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setValidationErrors({});
        }
        onOpenChange(open);
      }}
    >
      <DialogContent
        className={cn("sm:max-w-md", isMobile && "min-h-0 w-[95vw]")}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          setTimeout(() => {
            if (registrationRef.current) {
              registrationRef.current.focus();
            }
          }, 100);
        }}
      >
        <div
          ref={mobileScrollRef}
          className={cn(
            isMobile &&
              "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
          )}
          style={
            isMobile
              ? {
                  maxHeight:
                    maxHeightPx != null ? `${maxHeightPx}px` : undefined,
                  paddingBottom: Math.max(48, 36 + bottomInsetPx),
                }
              : undefined
          }
          onFocusCapture={(e) => {
            if (!isMobile) return;
            const root = e.currentTarget;
            const t = e.target as HTMLElement;
            if (t === root || !root.contains(t)) return;
            requestAnimationFrame(() => {
              t.scrollIntoView({ block: "nearest", inline: "nearest" });
            });
          }}
        >
          <DialogHeader>
            <DialogTitle
              className={cn("uppercase", isMobile ? "text-xl" : "text-2xl")}
            >
              Edit Defect Record
            </DialogTitle>
          </DialogHeader>

          <div className={cn("grid gap-4 py-4", isMobile && "gap-6")}>
            <DateTimeSection
              date={formData.date}
              time={formData.time}
              onDateChange={(value) => handleFieldChange("date", value)}
              onTimeChange={(value) => handleFieldChange("time", value)}
              validationErrors={validationErrors}
            />

            <RegistrationStationSection
              registration={formData.registration}
              station={formData.station}
              onRegistrationChange={(value) =>
                handleFieldChange("registration", value)
              }
              onStationChange={(value) => handleFieldChange("station", value)}
              registrationRef={registrationRef}
              stationRef={stationRef}
              validationErrors={validationErrors}
              handleKeyDown={handleKeyDown}
            />

            <DescriptionSection
              defect={formData.defect}
              remarks={formData.remarks}
              onDefectChange={(value) => handleFieldChange("defect", value)}
              onRemarksChange={(value) => handleFieldChange("remarks", value)}
              defectRef={defectRef}
              remarksRef={remarksRef}
              validationErrors={validationErrors}
              handleKeyDown={handleKeyDown}
            />

            <TimingSection
              eta={formData.eta}
              std={formData.std}
              upd={formData.upd}
              onEtaChange={(value) => handleFieldChange("eta", value)}
              onStdChange={(value) => handleFieldChange("std", value)}
              onUpdChange={(value) => handleFieldChange("upd", value)}
              onEnterPressEta={() => defectRef.current?.focus()}
              onEnterPressStd={() => remarksRef.current?.focus()}
              onEnterPressUpd={() => defectRef.current?.focus()}
            />

            <CheckboxGroup
              values={{
                nxs: formData.nxs,
                rst: formData.rst,
                dly: formData.dly,
                pln: formData.pln,
                sl: formData.sl,
                ok: formData.ok,
                isPublic: formData.isPublic,
              }}
              onCheckedChange={(field, checked) =>
                handleFieldChange(field, checked)
              }
            />

            <ActionButtons
              onClear={handleClear}
              onCancel={handleCancel}
              onSave={validateAndSubmit}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
