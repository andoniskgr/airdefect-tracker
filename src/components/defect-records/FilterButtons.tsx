
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Plus, Filter } from "lucide-react";
import { FilterType } from "./DefectRecord.types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

interface FilterButtonsProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  exportToExcel: () => void;
  onAddRecord: () => void;
}

export const FilterButtons = ({ 
  filter, 
  setFilter, 
  exportToExcel, 
  onAddRecord 
}: FilterButtonsProps) => {
  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Mobile filter buttons in drawer
  const renderMobileFilters = () => (
    <>
      <div className="flex justify-between items-center mb-4 p-2 bg-slate-100 rounded-md shadow-md">
        <Button 
          onClick={() => setFiltersOpen(true)}
          variant="outline"
          className="text-sm uppercase font-semibold bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
        >
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="text-sm uppercase bg-white text-slate-800 border-slate-300 hover:bg-slate-100 font-semibold"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="sr-only">Export to Excel</span>
          </Button>
          
          <Button onClick={onAddRecord} className="bg-slate-700 text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add Record</span>
          </Button>
        </div>
      </div>
      
      <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter Records</DrawerTitle>
            <DrawerDescription>Select a filter to apply to your records</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-3 p-4">
            <Button 
              onClick={() => {
                setFilter('all');
                setFiltersOpen(false);
              }}
              variant={filter === 'all' ? 'default' : 'outline'}
              className={`text-sm uppercase font-semibold w-full ${filter === 'all' ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-slate-300'}`}
            >
              All Records
            </Button>
            <Button 
              onClick={() => {
                setFilter('sl');
                setFiltersOpen(false);
              }}
              variant={filter === 'sl' ? 'default' : 'outline'}
              className={`text-sm uppercase font-semibold w-full ${filter === 'sl' ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-slate-300'}`}
            >
              Pending Only
            </Button>
            <Button 
              onClick={() => {
                setFilter('ok');
                setFiltersOpen(false);
              }}
              variant={filter === 'ok' ? 'default' : 'outline'}
              className={`text-sm uppercase font-semibold w-full ${filter === 'ok' ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-slate-300'}`}
            >
              OK Only
            </Button>
            <Button 
              onClick={() => {
                setFilter('pln');
                setFiltersOpen(false);
              }}
              variant={filter === 'pln' ? 'default' : 'outline'}
              className={`text-sm uppercase font-semibold w-full ${filter === 'pln' ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-slate-300'}`}
            >
              PLN Only
            </Button>
            <Button 
              onClick={() => {
                setFilter('nxs');
                setFiltersOpen(false);
              }}
              variant={filter === 'nxs' ? 'default' : 'outline'}
              className={`text-sm uppercase font-semibold w-full ${filter === 'nxs' ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-slate-300'}`}
            >
              NXS Only
            </Button>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );

  // Desktop filter buttons - the original layout
  const renderDesktopFilters = () => (
    <div className="flex justify-between items-center mb-4 p-2 bg-slate-100 rounded-md shadow-md">
      <div className="flex gap-2 items-center">
        <Button 
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          className={`text-sm uppercase font-semibold ${filter === 'all' ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'}`}
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
          onClick={() => setFilter('nxs')}
          variant={filter === 'nxs' ? 'default' : 'outline'}
          className={`text-sm uppercase font-semibold ${filter === 'nxs' ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'}`}
        >
          NXS Only
        </Button>
        <Button
          onClick={exportToExcel}
          variant="outline"
          className="text-sm uppercase ml-2 bg-white text-slate-800 border-slate-300 hover:bg-slate-100 font-semibold"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
        </Button>
      </div>

      <Button onClick={onAddRecord} className="bg-slate-700 text-white hover:bg-slate-800">
        <Plus className="mr-2 h-4 w-4" />
        Add Record
      </Button>
    </div>
  );

  return isMobile ? renderMobileFilters() : renderDesktopFilters();
};
