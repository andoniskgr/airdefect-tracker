
import React from 'react';
import { TimePicker } from '@/components/ui/time-picker';

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
  onEnterPressUpd
}: TimingSectionProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">ETA</label>
        <TimePicker
          value={eta}
          onChange={onEtaChange}
          onEnterPress={onEnterPressEta}
        />
      </div>
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">STD</label>
        <TimePicker
          value={std}
          onChange={onStdChange}
          onEnterPress={onEnterPressStd}
        />
      </div>
      <div>
        <label className="text-lg font-medium mb-1 block uppercase">UPD</label>
        <TimePicker
          value={upd}
          onChange={onUpdChange}
          onEnterPress={onEnterPressUpd}
        />
      </div>
    </div>
  );
};
