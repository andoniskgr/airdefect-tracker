import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Aircraft } from "@/types/aircraft";

interface AircraftFormProps {
  aircraftForm: Omit<Aircraft, "id">;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  handleSelectChange: (name: string, value: string) => void;
  existingTypes: string[];
  existingEngines: string[];
  formType: "add" | "edit";
}

export const AircraftForm = ({
  aircraftForm,
  handleInputChange,
  handleCheckboxChange,
  handleSelectChange,
  existingTypes,
  existingEngines,
  formType,
}: AircraftFormProps) => {
  const idPrefix = formType === "edit" ? "edit-" : "";

  const isCustomType =
    !existingTypes.includes(aircraftForm.type) && aircraftForm.type !== "";
  const isCustomEngine =
    !existingEngines.includes(aircraftForm.engine) &&
    aircraftForm.engine !== "";

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
        <div className="col-span-3">
          {isCustomType ? (
            <div>
              <Input
                placeholder="Enter custom aircraft type"
                value={aircraftForm.type}
                onChange={(e) => handleSelectChange("type", e.target.value)}
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleSelectChange("type", "")}
                className="text-sm text-blue-600 hover:underline mt-1"
              >
                ← Back to list
              </button>
            </div>
          ) : (
            <Select
              value={aircraftForm.type}
              onValueChange={(value) => {
                if (value === "custom") {
                  handleSelectChange("type", "");
                } else {
                  handleSelectChange("type", value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select aircraft type or add custom" />
              </SelectTrigger>
              <SelectContent>
                {existingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
                <SelectItem value="custom">+ Add Custom Type</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${idPrefix}engine`} className="text-right">
          Engine
        </Label>
        <div className="col-span-3">
          {isCustomEngine ? (
            <div>
              <Input
                placeholder="Enter custom engine type"
                value={aircraftForm.engine}
                onChange={(e) => handleSelectChange("engine", e.target.value)}
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleSelectChange("engine", "")}
                className="text-sm text-blue-600 hover:underline mt-1"
              >
                ← Back to list
              </button>
            </div>
          ) : (
            <Select
              value={aircraftForm.engine}
              onValueChange={(value) => {
                if (value === "custom") {
                  handleSelectChange("engine", "");
                } else {
                  handleSelectChange("engine", value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select engine type or add custom" />
              </SelectTrigger>
              <SelectContent>
                {existingEngines.map((engine) => (
                  <SelectItem key={engine} value={engine}>
                    {engine}
                  </SelectItem>
                ))}
                <SelectItem value="custom">+ Add Custom Engine</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
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
