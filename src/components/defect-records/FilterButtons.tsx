
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { FilterType } from "./DefectRecord.types";

interface FilterButtonsProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  exportToExcel: () => void;
}

export const FilterButtons = ({ filter, setFilter, exportToExcel }: FilterButtonsProps) => {
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
        PENDING
      </Button>
      <Button 
        onClick={() => setFilter('ok')}
        variant={filter === 'ok' ? 'default' : 'outline'}
        className="text-sm uppercase"
      >
        OK Only
      </Button>
      <Button 
        onClick={() => setFilter('pln')}
        variant={filter === 'pln' ? 'default' : 'outline'}
        className="text-sm uppercase"
      >
        PLN Only
      </Button>
      <Button
        onClick={exportToExcel}
        variant="outline"
        className="text-sm uppercase ml-2"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
      </Button>
    </div>
  );
};
