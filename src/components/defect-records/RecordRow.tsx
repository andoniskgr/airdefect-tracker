
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { MessageSquare, Pencil, Trash } from "lucide-react";
import { DefectRecord } from "./DefectRecord.types";
import { toast } from "sonner";

interface RecordRowProps {
  record: DefectRecord;
  handleEditRecord: (record: DefectRecord) => void;
  handleDeleteRecord: (id: string) => void;
  currentTime: Date;
}

export const RecordRow = ({ 
  record, 
  handleEditRecord, 
  handleDeleteRecord, 
  currentTime 
}: RecordRowProps) => {
  const shouldFlashUpd = (record: DefectRecord) => {
    if (!record.upd || record.ok) {
      return false;
    }
    
    const recordDate = new Date(record.date);
    const updTime = new Date(`${record.date}T${record.upd}:00`);
    
    return currentTime >= updTime;
  };

  // Define background colors that work well with dark text
  const getBgColor = () => {
    if (record.ok) return "bg-green-200 text-slate-800";
    if (record.sl) return "bg-yellow-200 text-slate-800";
    return "bg-white text-slate-800";
  };

  const copyToTeams = () => {
    try {
      // Create a simple, clean table format that will render with borders in Teams
      const tableText = `| TIME | REG | STA | DEFECT | ETA | STD |
|------|-----|-----|--------|-----|-----|
| ${record.time} | ${record.registration} | ${record.station} | ${record.defect} | ${record.eta} | ${record.std} |`;
      
      navigator.clipboard.writeText(tableText);
      toast.success("Copied table to clipboard for Teams");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <TableRow 
      key={record.id} 
      className={`table-animation ${getBgColor()} hover:bg-slate-50`}
    >
      <TableCell className="text-lg uppercase px-4 py-3 font-medium">{record.time}</TableCell>
      <TableCell className="text-lg uppercase px-4 py-3 font-medium">{record.registration}</TableCell>
      <TableCell className="text-lg uppercase px-4 py-3 font-medium">{record.station}</TableCell>
      <TableCell className="text-lg uppercase px-4 py-3 font-medium">{record.defect}</TableCell>
      <TableCell className="text-lg uppercase px-4 py-3 font-medium">{record.remarks}</TableCell>
      <TableCell className="text-lg uppercase px-4 py-3 font-medium">{record.eta}</TableCell>
      <TableCell className="text-lg uppercase px-4 py-3 font-medium">{record.std}</TableCell>
      <TableCell className={`text-lg uppercase px-4 py-3 font-medium ${shouldFlashUpd(record) ? 'flash-upd' : ''}`}>
        {record.upd}
      </TableCell>
      <TableCell className="text-lg uppercase text-center px-4 py-3 font-medium">{record.rst ? "YES" : "NO"}</TableCell>
      <TableCell className="text-lg uppercase text-center px-4 py-3 font-medium">{record.sl ? "YES" : "NO"}</TableCell>
      <TableCell className="text-lg uppercase text-center px-4 py-3 font-medium">{record.pln ? "YES" : "NO"}</TableCell>
      <TableCell className="text-lg uppercase text-center px-4 py-3 font-medium">{record.ok ? "YES" : "NO"}</TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleEditRecord(record)}
            className="p-2 h-8 w-8 bg-slate-100 hover:bg-slate-200 border-slate-300"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => handleDeleteRecord(record.id)}
            className="p-2 h-8 w-8"
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={copyToTeams}
            className="p-2 h-8 w-8 bg-blue-500 hover:bg-blue-600"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="sr-only">Copy for Teams</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
