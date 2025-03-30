
import React from 'react';
import { Button } from "@/components/ui/button";

interface EditActionButtonsProps {
  onCancel: () => void;
  onUpdate: () => void;
}

export const EditActionButtons = ({ onCancel, onUpdate }: EditActionButtonsProps) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button 
        variant="destructive" 
        onClick={onCancel}
        className="text-lg uppercase"
      >
        Cancel
      </Button>
      <Button 
        onClick={onUpdate} 
        className="bg-green-600 text-white hover:bg-green-700 text-lg uppercase"
      >
        Update
      </Button>
    </div>
  );
};
