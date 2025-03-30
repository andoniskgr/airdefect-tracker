
import React from 'react';
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onClear: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export const ActionButtons = ({ onClear, onCancel, onSave }: ActionButtonsProps) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button variant="outline" onClick={onClear} className="text-lg uppercase">
        Clear
      </Button>
      <Button 
        variant="destructive" 
        onClick={onCancel}
        className="text-lg uppercase"
      >
        Cancel
      </Button>
      <Button 
        onClick={onSave} 
        className="bg-green-600 text-white hover:bg-green-700 text-lg uppercase"
      >
        Save
      </Button>
    </div>
  );
};
