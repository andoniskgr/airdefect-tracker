
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Aircraft } from "@/types/aircraft";

interface AircraftFormProps {
  aircraftForm: Omit<Aircraft, 'id'>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  formType: 'add' | 'edit';
}

export const AircraftForm = ({ 
  aircraftForm, 
  handleInputChange, 
  handleCheckboxChange,
  formType
}: AircraftFormProps) => {
  const idPrefix = formType === 'edit' ? 'edit-' : '';
  
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${idPrefix}registration`} className="text-right">
          A/C
        </Label>
        <Input
          id={`${idPrefix}registration`}
          name="registration"
          value={aircraftForm.registration}
          onChange={handleInputChange}
          className="col-span-3"
          placeholder="e.g. SX-DGT"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${idPrefix}type`} className="text-right">
          Type
        </Label>
        <Input
          id={`${idPrefix}type`}
          name="type"
          value={aircraftForm.type}
          onChange={handleInputChange}
          className="col-span-3"
          placeholder="e.g. A320-232"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${idPrefix}engine`} className="text-right">
          Engine
        </Label>
        <Input
          id={`${idPrefix}engine`}
          name="engine"
          value={aircraftForm.engine}
          onChange={handleInputChange}
          className="col-span-3"
          placeholder="e.g. IAE V2527-A5"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${idPrefix}msn`} className="text-right">
          MSN
        </Label>
        <Input
          id={`${idPrefix}msn`}
          name="msn"
          value={aircraftForm.msn}
          onChange={handleInputChange}
          className="col-span-3"
          placeholder="e.g. 3162"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${idPrefix}cls`} className="text-right">
          CLS
        </Label>
        <div className="col-span-3">
          <Checkbox
            id={`${idPrefix}cls`}
            checked={aircraftForm.cls}
            onCheckedChange={(checked) => 
              handleCheckboxChange("cls", checked === true)
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${idPrefix}wifi`} className="text-right">
          WIFI
        </Label>
        <div className="col-span-3">
          <Checkbox
            id={`${idPrefix}wifi`}
            checked={aircraftForm.wifi}
            onCheckedChange={(checked) => 
              handleCheckboxChange("wifi", checked === true)
            }
          />
        </div>
      </div>
    </div>
  );
};
