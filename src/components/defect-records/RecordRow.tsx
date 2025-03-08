
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import { DefectRecord } from "./DefectRecord.types";

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

  return (
    <TableRow 
      key={record.id} 
      className="table-animation"
      style={{
        backgroundColor: record.ok ? "#F2FCE2" : record.sl ? "#FEF7CD" : "transparent"
      }}
    >
      <TableCell className="text-lg uppercase px-2">{record.time}</TableCell>
      <TableCell className="text-lg uppercase px-2">{record.registration}</TableCell>
      <TableCell className="text-lg uppercase px-2">{record.station}</TableCell>
      <TableCell className="text-lg uppercase px-2">{record.defect}</TableCell>
      <TableCell className="text-lg uppercase px-2">{record.remarks}</TableCell>
      <TableCell className="text-lg uppercase px-2">{record.eta}</TableCell>
      <TableCell className="text-lg uppercase px-2">{record.std}</TableCell>
      <TableCell className={`text-lg uppercase px-2 ${shouldFlashUpd(record) ? 'flash-upd' : ''}`}>
        {record.upd}
      </TableCell>
      <TableCell className="text-lg uppercase text-center px-2">{record.rst ? "YES" : "NO"}</TableCell>
      <TableCell className="text-lg uppercase text-center px-2">{record.sl ? "YES" : "NO"}</TableCell>
      <TableCell className="text-lg uppercase text-center px-2">{record.ok ? "YES" : "NO"}</TableCell>
      <TableCell className="text-lg uppercase text-center px-2">{record.pln ? "YES" : "NO"}</TableCell>
      <TableCell className="px-2">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleEditRecord(record)}
            className="p-2 h-8 w-8"
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
        </div>
      </TableCell>
    </TableRow>
  );
};
