import React from "react";
import { TimePicker } from "@/components/ui/time-picker";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimingSectionProps {
  eta: string;
  std: string;
  upd: string;
  onEtaChange: (value: string) => void;
  onStdChange: (value: string) => void;
  onUpdChange: (value: string) => void;
  onEnterPressEta?: () => void;
  onEnterPressStd?: () => void;
  onEnterPressUpd?: () => void;
}

export const TimingSection = ({
  eta,
  std,
  upd,
  onEtaChange,
  onStdChange,
  onUpdChange,
  onEnterPressEta,
  onEnterPressStd,
  onEnterPressUpd,
}: TimingSectionProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">ETA</label>
        <TimePicker
          value={eta}
          onChange={onEtaChange}
          onEnterPress={onEnterPressEta}
          hideCurrentTimeButton={isMobile}
        />
      </div>
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">STD</label>
        <TimePicker
          value={std}
          onChange={onStdChange}
          onEnterPress={onEnterPressStd}
          hideCurrentTimeButton={isMobile}
        />
      </div>
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">UPD</label>
        <TimePicker
          value={upd}
          onChange={onUpdChange}
          onEnterPress={onEnterPressUpd}
          hideCurrentTimeButton={isMobile}
        />
      </div>
    </div>
  );
};
