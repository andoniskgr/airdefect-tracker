import React from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ServiceOrderActionsProps {
  onPrepareAndCopy: () => void;
  onClear: () => void;
}

const ServiceOrderActions: React.FC<ServiceOrderActionsProps> = ({
  onPrepareAndCopy,
  onClear,
}) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "flex justify-center",
        isMobile ? "flex-col space-y-3 space-x-0" : "space-x-4"
      )}
    >
      <Button
        onClick={onPrepareAndCopy}
        className={cn(
          "bg-green-600 hover:bg-green-700",
          isMobile && "h-12 text-base w-full"
        )}
      >
        Prepare & Copy
      </Button>
      <Button
        onClick={onClear}
        className={cn(
          "bg-red-600 hover:bg-red-700",
          isMobile && "h-12 text-base w-full"
        )}
      >
        Clear
      </Button>
    </div>
  );
};

export default ServiceOrderActions;
