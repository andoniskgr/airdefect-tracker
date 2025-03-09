
import React from "react";
import { Button } from "@/components/ui/button";

interface ServiceOrderActionsProps {
  onPrepareAndCopy: () => void;
  onClear: () => void;
}

const ServiceOrderActions: React.FC<ServiceOrderActionsProps> = ({
  onPrepareAndCopy,
  onClear
}) => {
  return (
    <div className="flex space-x-4 justify-center">
      <Button 
        onClick={onPrepareAndCopy}
        className="bg-green-600 hover:bg-green-700"
      >
        Prepare & Copy
      </Button>
      <Button 
        onClick={onClear}
        className="bg-red-600 hover:bg-red-700"
      >
        Clear
      </Button>
    </div>
  );
};

export default ServiceOrderActions;
