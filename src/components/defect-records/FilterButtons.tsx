
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
        onClick={() => {
          // Toggle between sl and sl-ok filters
          if (filter === 'sl') {
            if (filter === 'sl-ok') {
              setFilter('sl');
            } else {
              setFilter('sl');
            }
          } else if (filter === 'sl-ok') {
            setFilter('ok');
          } else if (filter === 'ok') {
            setFilter('sl-ok');
          } else {
            setFilter('sl');
          }
        }}
        variant={filter === 'sl' ? 'default' : 'outline'}
        className={`text-sm uppercase ${filter === 'sl-ok' ? 'bg-yellow-100 text-yellow-900 border-yellow-300' : ''}`}
      >
        SL Only
      </Button>
      <Button 
        onClick={() => {
          // Toggle between ok and sl-ok filters
          if (filter === 'ok') {
            if (filter === 'sl-ok') {
              setFilter('ok');
            } else {
              setFilter('ok');
            }
          } else if (filter === 'sl-ok') {
            setFilter('sl');
          } else if (filter === 'sl') {
            setFilter('sl-ok');
          } else {
            setFilter('ok');
          }
        }}
        variant={filter === 'ok' ? 'default' : 'outline'}
        className={`text-sm uppercase ${filter === 'sl-ok' ? 'bg-green-100 text-green-900 border-green-300' : ''}`}
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
}
