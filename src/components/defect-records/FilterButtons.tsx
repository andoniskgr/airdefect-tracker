
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { FilterType } from "./DefectRecord.types";

interface FilterButtonsProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  exportToPdf: () => void;
}

export const FilterButtons = ({ filter, setFilter, exportToPdf }: FilterButtonsProps) => {
  return (
    <div className="flex gap-2 items-center">
      <Button 
        onClick={() => setFilter('all')}
        variant={filter === 'all' ? 'default' : 'outline'}
        className="text-sm uppercase"
      >
        All
      </Button>
      <Button 
        onClick={() => setFilter('sl')}
        variant={filter === 'sl' ? 'default' : 'outline'}
        className="text-sm uppercase"
      >
        SL Only
      </Button>
      <Button 
        onClick={() => setFilter('ok')}
        variant={filter === 'ok' ? 'default' : 'outline'}
        className="text-sm uppercase"
      >
        OK Only
      </Button>
      <Button
        onClick={exportToPdf}
        variant="outline"
        className="text-sm uppercase ml-2"
      >
        <FileDown className="mr-2 h-4 w-4" /> Export PDF
      </Button>
    </div>
  );
};
