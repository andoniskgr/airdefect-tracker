import React from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  onClear: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export const ActionButtons = ({
  onClear,
  onCancel,
  onSave,
}: ActionButtonsProps) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "flex space-x-4",
        isMobile ? "flex-col space-x-0 space-y-3" : "justify-end"
      )}
    >
      <Button
        variant="outline"
        onClick={onClear}
        className={cn(
          "uppercase",
          isMobile ? "h-12 text-base w-full" : "text-lg"
        )}
      >
        Clear
      </Button>
      <Button
        variant="destructive"
        onClick={onCancel}
        className={cn(
          "uppercase",
          isMobile ? "h-12 text-base w-full" : "text-lg"
        )}
      >
        Cancel
      </Button>
      <Button
        onClick={onSave}
        className={cn(
          "bg-green-600 text-white hover:bg-green-700 uppercase",
          isMobile ? "h-12 text-base w-full" : "text-lg"
        )}
      >
        Save
      </Button>
    </div>
  );
};
