import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AircraftForm } from "./AircraftForm";
import { Aircraft } from "@/types/aircraft";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AddAircraftModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  aircraftForm: Omit<Aircraft, "id">;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  handleSelectChange: (name: string, value: string) => void;
  existingTypes: string[];
  existingEngines: string[];
  handleAddSubmit: () => void;
}

export const AddAircraftModal = ({
  isOpen,
  onOpenChange,
  aircraftForm,
  handleInputChange,
  handleCheckboxChange,
  handleSelectChange,
  existingTypes,
  existingEngines,
  handleAddSubmit,
}: AddAircraftModalProps) => {
  const isMobile = useIsMobile();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-md",
          isMobile && "w-[95vw] h-[90vh] max-h-[90vh] overflow-y-auto"
        )}
      >
        <DialogHeader>
          <DialogTitle className={cn(isMobile ? "text-xl" : "text-2xl")}>
            Add New Aircraft
          </DialogTitle>
        </DialogHeader>
        <AircraftForm
          aircraftForm={aircraftForm}
          handleInputChange={handleInputChange}
          handleCheckboxChange={handleCheckboxChange}
          handleSelectChange={handleSelectChange}
          existingTypes={existingTypes}
          existingEngines={existingEngines}
          formType="add"
        />
        <DialogFooter
          className={cn(isMobile && "flex-col space-y-3 space-x-0")}
        >
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={cn(isMobile && "h-12 text-base w-full")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddSubmit}
            className={cn(isMobile && "h-12 text-base w-full")}
          >
            Add Aircraft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
