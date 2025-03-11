
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AircraftForm } from "./AircraftForm";
import { Aircraft } from "@/types/aircraft";

interface EditAircraftModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  aircraftForm: Omit<Aircraft, 'id'>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  handleEditSubmit: () => void;
}

export const EditAircraftModal = ({
  isOpen,
  onOpenChange,
  aircraftForm,
  handleInputChange,
  handleCheckboxChange,
  handleEditSubmit
}: EditAircraftModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Aircraft</DialogTitle>
        </DialogHeader>
        <AircraftForm 
          aircraftForm={aircraftForm}
          handleInputChange={handleInputChange}
          handleCheckboxChange={handleCheckboxChange}
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
