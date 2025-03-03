
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { FilterType, ExportType } from "./DefectRecord.types";

interface FilterButtonsProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  exportToPdf: () => void;
  exportToExcel: () => void;
}

export const FilterButtons = ({ filter, setFilter, exportToPdf, exportToExcel }: FilterButtonsProps) => {
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
        <FileDown className="mr-2 h-4 w-4" /> PDF
      </Button>
      <Button
        onClick={exportToExcel}
        variant="outline"
        className="text-sm uppercase"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
      </Button>
    </div>
  );
};
