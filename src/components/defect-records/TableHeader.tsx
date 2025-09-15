import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

interface TableHeaderProps {
  handleSort: (column: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
}

export const DefectTableHeader = ({
  handleSort,
  sortConfig,
}: TableHeaderProps) => {
  const isMobile = useIsMobile();

  const getSortIndicator = (columnName: string) => {
    if (sortConfig.key === columnName) {
      return (
        <span className="ml-1 text-white">
          {sortConfig.direction === "asc" ? "↑" : "↓"}
        </span>
      );
    }
    return null;
  };

  const renderSortableHeader = (
    label: string,
    column: string,
    abbreviation?: string,
    centerAlign = false
  ) => {
    // Use abbreviations on mobile, full labels on desktop
    const displayText = isMobile
      ? abbreviation || label
      : abbreviation || label;

    return (
      <TableHead
        className={`${
          isMobile ? "text-xs px-0 py-2" : "text-lg px-0 py-3"
        } uppercase cursor-pointer text-white font-bold ${
          centerAlign ? "text-center" : ""
        }`}
        onClick={() => handleSort(column)}
        style={{ textAlign: centerAlign ? "center" : "left" }}
      >
        <div
          className={`flex items-center ${centerAlign ? "justify-center" : ""}`}
        >
          {displayText}
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
          {renderSortableHeader("DLY", "dly", undefined, true)}
          {renderSortableHeader("SL", "sl", undefined, true)}
          {renderSortableHeader("OK", "ok", undefined, true)}
          <TableHead
            className="text-xs uppercase px-0 py-2 text-white font-bold text-center"
            style={{ textAlign: "center" }}
          >
            Actions
          </TableHead>
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
        {renderSortableHeader("NXS", "nxs", undefined, true)}
        {renderSortableHeader("RST", "rst", undefined, true)}
        {renderSortableHeader("DLY", "dly", undefined, true)}
        {renderSortableHeader("SL", "sl", undefined, true)}
        {renderSortableHeader("PLN", "pln", undefined, true)}
        {renderSortableHeader("OK", "ok", undefined, true)}
        <TableHead
          className="text-lg uppercase px-0 py-3 text-white font-bold text-center"
          style={{ textAlign: "center" }}
        >
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
