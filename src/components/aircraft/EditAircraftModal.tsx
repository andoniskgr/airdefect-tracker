import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AircraftForm } from "./AircraftForm";
import { Aircraft } from "@/types/aircraft";

interface EditAircraftModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  aircraftForm: Omit<Aircraft, "id">;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  handleSelectChange: (name: string, value: string) => void;
  existingTypes: string[];
  existingEngines: string[];
  handleEditSubmit: () => void;
}

export const EditAircraftModal = ({
  isOpen,
  onOpenChange,
  aircraftForm,
  handleInputChange,
  handleBlur,
  handleCheckboxChange,
  handleSelectChange,
  existingTypes,
  existingEngines,
  handleEditSubmit,
}: EditAircraftModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Aircraft</DialogTitle>
          <DialogDescription>
            Update the aircraft information below.
          </DialogDescription>
        </DialogHeader>
        <AircraftForm
          aircraftForm={aircraftForm}
          handleInputChange={handleInputChange}
          handleBlur={handleBlur}
          handleCheckboxChange={handleCheckboxChange}
          handleSelectChange={handleSelectChange}
          existingTypes={existingTypes}
          existingEngines={existingEngines}
          formType="edit"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
