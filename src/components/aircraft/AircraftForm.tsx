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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();

  const isCustomType =
    !existingTypes.includes(aircraftForm.type) && aircraftForm.type !== "";
  const isCustomEngine =
    !existingEngines.includes(aircraftForm.engine) &&
    aircraftForm.engine !== "";

  return (
    <div className={cn("grid gap-4 py-4", isMobile && "gap-6")}>
      <div
        className={cn(
          "grid items-center gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-4"
        )}
      >
        <Label
          htmlFor={`${idPrefix}registration`}
          className={cn(isMobile ? "text-left" : "text-right")}
        >
          A/C
        </Label>
        <Input
          id={`${idPrefix}registration`}
          name="registration"
          value={aircraftForm.registration}
          onChange={handleInputChange}
          className={cn(isMobile ? "h-12 text-base" : "col-span-3")}
          placeholder="e.g. SX-DGT"
        />
      </div>
      <div
        className={cn(
          "grid items-center gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-4"
        )}
      >
        <Label
          htmlFor={`${idPrefix}type`}
          className={cn(isMobile ? "text-left" : "text-right")}
        >
          Type
        </Label>
        <div className={cn(isMobile ? "w-full" : "col-span-3")}>
          {isCustomType ? (
            <div>
              <Input
                placeholder="Enter custom aircraft type"
                value={aircraftForm.type}
                onChange={(e) => handleSelectChange("type", e.target.value)}
                autoFocus
                className={cn(isMobile && "h-12 text-base")}
              />
              <button
                type="button"
                onClick={() => handleSelectChange("type", "")}
                className={cn(
                  "text-blue-600 hover:underline mt-1",
                  isMobile ? "text-base" : "text-sm"
                )}
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
              <SelectTrigger className={cn(isMobile && "h-12 text-base")}>
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
      <div
        className={cn(
          "grid items-center gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-4"
        )}
      >
        <Label
          htmlFor={`${idPrefix}engine`}
          className={cn(isMobile ? "text-left" : "text-right")}
        >
          Engine
        </Label>
        <div className={cn(isMobile ? "w-full" : "col-span-3")}>
          {isCustomEngine ? (
            <div>
              <Input
                placeholder="Enter custom engine type"
                value={aircraftForm.engine}
                onChange={(e) => handleSelectChange("engine", e.target.value)}
                autoFocus
                className={cn(isMobile && "h-12 text-base")}
              />
              <button
                type="button"
                onClick={() => handleSelectChange("engine", "")}
                className={cn(
                  "text-blue-600 hover:underline mt-1",
                  isMobile ? "text-base" : "text-sm"
                )}
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
              <SelectTrigger className={cn(isMobile && "h-12 text-base")}>
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
      <div
        className={cn(
          "grid items-center gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-4"
        )}
      >
        <Label
          htmlFor={`${idPrefix}msn`}
          className={cn(isMobile ? "text-left" : "text-right")}
        >
          MSN
        </Label>
        <Input
          id={`${idPrefix}msn`}
          name="msn"
          value={aircraftForm.msn}
          onChange={handleInputChange}
          className={cn(isMobile ? "h-12 text-base" : "col-span-3")}
          placeholder="e.g. 3162"
        />
      </div>
      <div
        className={cn(
          "grid items-center gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-4"
        )}
      >
        <Label
          htmlFor={`${idPrefix}cls`}
          className={cn(isMobile ? "text-left" : "text-right")}
        >
          CLS
        </Label>
        <div className={cn(isMobile ? "w-full" : "col-span-3")}>
          <Checkbox
            id={`${idPrefix}cls`}
            checked={aircraftForm.cls}
            onCheckedChange={(checked) =>
              handleCheckboxChange("cls", checked === true)
            }
            className={cn(isMobile && "h-6 w-6")}
          />
        </div>
      </div>
      <div
        className={cn(
          "grid items-center gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-4"
        )}
      >
        <Label
          htmlFor={`${idPrefix}wifi`}
          className={cn(isMobile ? "text-left" : "text-right")}
        >
          WIFI
        </Label>
        <div className={cn(isMobile ? "w-full" : "col-span-3")}>
          <Checkbox
            id={`${idPrefix}wifi`}
            checked={aircraftForm.wifi}
            onCheckedChange={(checked) =>
              handleCheckboxChange("wifi", checked === true)
            }
            className={cn(isMobile && "h-6 w-6")}
          />
        </div>
      </div>
    </div>
  );
};
