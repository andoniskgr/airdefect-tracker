
import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxGroupProps {
  values: {
    nxs: boolean;
    rst: boolean;
    pln: boolean;
    sl: boolean;
    ok: boolean;
  };
  onCheckedChange: (field: 'nxs' | 'rst' | 'pln' | 'sl' | 'ok', checked: boolean) => void;
}

export const CheckboxGroup = ({ values, onCheckedChange }: CheckboxGroupProps) => {
  return (
    <div className="flex justify-center space-x-6 mt-2">
      <div className="flex flex-col items-center space-y-1">
        <Checkbox
          id="nxs"
          checked={values.nxs}
          onCheckedChange={(checked) => 
            onCheckedChange('nxs', checked as boolean)
          }
          className="h-5 w-5"
        />
        <label htmlFor="nxs" className="text-lg font-medium uppercase">
          NXS
        </label>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <Checkbox
          id="rst"
          checked={values.rst}
          onCheckedChange={(checked) => 
            onCheckedChange('rst', checked as boolean)
          }
          className="h-5 w-5"
        />
        <label htmlFor="rst" className="text-lg font-medium uppercase">
          RST
        </label>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <Checkbox
          id="pln"
          checked={values.pln}
          onCheckedChange={(checked) => 
            onCheckedChange('pln', checked as boolean)
          }
          className="h-5 w-5"
        />
        <label htmlFor="pln" className="text-lg font-medium uppercase">
          PLN
        </label>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <Checkbox
          id="sl"
          checked={values.sl}
          onCheckedChange={(checked) => 
            onCheckedChange('sl', checked as boolean)
          }
          className="h-5 w-5"
        />
        <label htmlFor="sl" className="text-lg font-medium uppercase">
          SL
        </label>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <Checkbox
          id="ok"
          checked={values.ok}
          onCheckedChange={(checked) => 
            onCheckedChange('ok', checked as boolean)
          }
          className="h-5 w-5"
        />
        <label htmlFor="ok" className="text-lg font-medium uppercase">
          OK
        </label>
      </div>
    </div>
  );
};
