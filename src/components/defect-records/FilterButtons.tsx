
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
    <div className="flex gap-2 items-center mb-4 p-2 bg-slate-100 rounded-md shadow-md">
      <Button 
        onClick={() => setFilter('all')}
        variant={filter === 'all' ? 'default' : 'outline'}
        className="text-sm uppercase font-semibold bg-slate-700 text-white hover:bg-slate-800"
      >
        All
      </Button>
      <Button 
        onClick={() => setFilter('sl')}
        variant={filter === 'sl' ? 'default' : 'outline'}
        className={`text-sm uppercase font-semibold ${filter === 'sl' ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'}`}
      >
        PENDING
      </Button>
      <Button 
        onClick={() => setFilter('ok')}
        variant={filter === 'ok' ? 'default' : 'outline'}
        className={`text-sm uppercase font-semibold ${filter === 'ok' ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'}`}
      >
        OK Only
      </Button>
      <Button 
        onClick={() => setFilter('pln')}
        variant={filter === 'pln' ? 'default' : 'outline'}
        className={`text-sm uppercase font-semibold ${filter === 'pln' ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'}`}
      >
        PLN Only
      </Button>
      <Button
        onClick={exportToExcel}
        variant="outline"
        className="text-sm uppercase ml-2 bg-white text-slate-800 border-slate-300 hover:bg-slate-100 font-semibold"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
      </Button>
    </div>
  );
};
