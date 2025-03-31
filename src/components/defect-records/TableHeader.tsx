
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TableHeaderProps {
  handleSort: (column: string) => void;
  sortConfig: { key: string, direction: 'asc' | 'desc' };
}

export const DefectTableHeader = ({ handleSort, sortConfig }: TableHeaderProps) => {
  const isMobile = useIsMobile();
  
  const getSortIndicator = (columnName: string) => {
    if (sortConfig.key === columnName) {
      return (
        <span className="ml-1 text-white">
          {sortConfig.direction === 'asc' ? '↑' : '↓'}
        </span>
      );
    }
    return null;
  };

  const renderSortableHeader = (label: string, column: string, abbreviation?: string) => {
    // Use abbreviations on mobile, full labels on desktop
    const displayText = isMobile ? (abbreviation || label) : (abbreviation || label);
    
    return (
      <TableHead 
        className={`${isMobile ? 'text-xs px-1 py-2' : 'text-lg px-4 py-3'} uppercase cursor-pointer text-white font-bold`}
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center">
          {displayText} 
          <ArrowUpDown className={`inline ${isMobile ? 'h-3 w-3 ml-1' : 'h-4 w-4 ml-2'}`} /> 
          {getSortIndicator(column)}
        </div>
      </TableHead>
    );
  };

  // On mobile, show fewer columns
  if (isMobile) {
    return (
      <TableHeader className="bg-slate-800 border-b border-slate-600">
        <TableRow>
          {renderSortableHeader("Time", "time")}
          {renderSortableHeader("REG", "registration", "REG")}
          {renderSortableHeader("STA", "station", "STA")}
          {renderSortableHeader("Defect", "defect")}
          {renderSortableHeader("SL", "sl")}
          {renderSortableHeader("OK", "ok")}
          <TableHead className="text-xs uppercase px-1 py-2 text-white font-bold">Actions</TableHead>
        </TableRow>
      </TableHeader>
    );
  }

  // Desktop view with all columns
  return (
    <TableHeader className="bg-slate-800 border-b border-slate-600">
      <TableRow>
        {renderSortableHeader("Time", "time")}
        {renderSortableHeader("Registration", "registration", "REG.")}
        {renderSortableHeader("Station", "station", "STA.")}
        {renderSortableHeader("Defect", "defect")}
        {renderSortableHeader("Remarks", "remarks")}
        {renderSortableHeader("ETA", "eta")}
        {renderSortableHeader("STD", "std")}
        {renderSortableHeader("UPD", "upd")}
        {renderSortableHeader("NXS", "nxs")}
        {renderSortableHeader("RST", "rst")}
        {renderSortableHeader("SL", "sl")}
        {renderSortableHeader("PLN", "pln")}
        {renderSortableHeader("OK", "ok")}
        <TableHead className="text-lg uppercase px-4 py-3 text-white font-bold">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
