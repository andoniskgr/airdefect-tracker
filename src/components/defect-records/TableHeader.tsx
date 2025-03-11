
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

interface TableHeaderProps {
  handleSort: (column: string) => void;
  sortConfig: { key: string, direction: 'asc' | 'desc' };
}

export const DefectTableHeader = ({ handleSort, sortConfig }: TableHeaderProps) => {
  const getSortIndicator = (columnName: string) => {
    if (sortConfig.key === columnName) {
      return (
        <span className="ml-1">
          {sortConfig.direction === 'asc' ? '↑' : '↓'}
        </span>
      );
    }
    return null;
  };

  const renderSortableHeader = (label: string, column: string, abbreviation?: string) => (
    <TableHead 
      className="text-lg uppercase cursor-pointer px-2 text-white font-semibold" 
      onClick={() => handleSort(column)}
    >
      {abbreviation || label} <ArrowUpDown className="inline h-4 w-4 ml-1" /> 
      {getSortIndicator(column)}
    </TableHead>
  );

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
        {renderSortableHeader("RST", "rst")}
        {renderSortableHeader("SL", "sl")}
        {renderSortableHeader("OK", "ok")}
        {renderSortableHeader("PLN", "pln")}
        <TableHead className="text-lg uppercase px-2 text-white font-semibold">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
