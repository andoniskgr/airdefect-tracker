
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AircraftForm } from "./AircraftForm";
import { Aircraft } from "@/types/aircraft";

interface AddAircraftModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  aircraftForm: Omit<Aircraft, 'id'>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  handleAddSubmit: () => void;
}

export const AddAircraftModal = ({
  isOpen,
  onOpenChange,
  aircraftForm,
  handleInputChange,
  handleCheckboxChange,
  handleAddSubmit
}: AddAircraftModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Aircraft</DialogTitle>
        </DialogHeader>
        <AircraftForm 
          aircraftForm={aircraftForm}
          handleInputChange={handleInputChange}
          handleCheckboxChange={handleCheckboxChange}
          formType="add"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddSubmit}>Add Aircraft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
