import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface CheckboxGroupProps {
  values: {
    nxs: boolean;
    rst: boolean;
    dly: boolean; // Added DLY field
    pln: boolean;
    sl: boolean;
    ok: boolean;
    isPublic: boolean; // Added isPublic field
  };
  onCheckedChange: (
    field: "nxs" | "rst" | "dly" | "pln" | "sl" | "ok" | "isPublic",
    checked: boolean
  ) => void;
}

export const CheckboxGroup = ({
  values,
  onCheckedChange,
}: CheckboxGroupProps) => {
  const isMobile = useIsMobile();

  return (
    <div>
      <div
        className={cn(
          "flex justify-center mt-2",
          isMobile ? "flex-wrap gap-4" : "space-x-6"
        )}
      >
        <div className="flex flex-col items-center space-y-1">
          <Checkbox
            id="nxs"
            checked={values.nxs}
            onCheckedChange={(checked) =>
              onCheckedChange("nxs", checked as boolean)
            }
            className={cn(isMobile ? "h-6 w-6" : "h-5 w-5")}
          />
          <label
            htmlFor="nxs"
            className={cn(
              "font-medium uppercase",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            NXS
          </label>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <Checkbox
            id="rst"
            checked={values.rst}
            onCheckedChange={(checked) =>
              onCheckedChange("rst", checked as boolean)
            }
            className={cn(isMobile ? "h-6 w-6" : "h-5 w-5")}
          />
          <label
            htmlFor="rst"
            className={cn(
              "font-medium uppercase",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            RST
          </label>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <Checkbox
            id="dly"
            checked={values.dly}
            onCheckedChange={(checked) =>
              onCheckedChange("dly", checked as boolean)
            }
            className={cn(isMobile ? "h-6 w-6" : "h-5 w-5")}
          />
          <label
            htmlFor="dly"
            className={cn(
              "font-medium uppercase",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            DLY
          </label>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <Checkbox
            id="pln"
            checked={values.pln}
            onCheckedChange={(checked) =>
              onCheckedChange("pln", checked as boolean)
            }
            className={cn(isMobile ? "h-6 w-6" : "h-5 w-5")}
          />
          <label
            htmlFor="pln"
            className={cn(
              "font-medium uppercase",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            PLN
          </label>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <Checkbox
            id="sl"
            checked={values.sl}
            onCheckedChange={(checked) =>
              onCheckedChange("sl", checked as boolean)
            }
            className={cn(isMobile ? "h-6 w-6" : "h-5 w-5")}
          />
          <label
            htmlFor="sl"
            className={cn(
              "font-medium uppercase",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            SL
          </label>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <Checkbox
            id="ok"
            checked={values.ok}
            onCheckedChange={(checked) =>
              onCheckedChange("ok", checked as boolean)
            }
            className={cn(isMobile ? "h-6 w-6" : "h-5 w-5")}
          />
          <label
            htmlFor="ok"
            className={cn(
              "font-medium uppercase",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            OK
          </label>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <div className="flex flex-col items-center space-y-1">
          <Checkbox
            id="isPublic"
            checked={values.isPublic}
            onCheckedChange={(checked) =>
              onCheckedChange("isPublic", checked as boolean)
            }
            className={cn(isMobile ? "h-6 w-6" : "h-5 w-5")}
          />
          <label
            htmlFor="isPublic"
            className={cn("font-medium", isMobile ? "text-base" : "text-lg")}
          >
            Public
          </label>
          <span
            className={cn(
              "text-gray-500 text-center",
              isMobile ? "text-xs" : "text-xs"
            )}
          >
            Visible to other users
          </span>
        </div>
      </div>
    </div>
  );
};
