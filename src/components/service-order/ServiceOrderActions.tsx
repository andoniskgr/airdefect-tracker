import React from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ServiceOrderActionsProps {
  onClear: () => void;
  isPrepareDisabled?: boolean;
}

const ServiceOrderActions: React.FC<ServiceOrderActionsProps> = ({
  onClear,
  isPrepareDisabled = false,
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
        type="submit"
        disabled={isPrepareDisabled}
        className={cn(
          "bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed",
          isMobile && "h-12 text-base w-full"
        )}
      >
        Prepare & Copy
      </Button>
      <Button
        type="button"
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
