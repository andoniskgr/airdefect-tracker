
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash } from "lucide-react";
import { format } from 'date-fns';
import { DefectRecord } from "./DefectRecord.types";

interface RecordsTableProps {
  records: DefectRecord[];
  handleSort: () => void;
  handleEditRecord: (record: DefectRecord) => void;
  handleDeleteRecord: (id: string) => void;
}

export const RecordsTable = ({ 
  records, 
  handleSort, 
  handleEditRecord, 
  handleDeleteRecord 
}: RecordsTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border max-w-[1920px] mx-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer text-lg uppercase" onClick={handleSort}>
              Date/Time1
              <ArrowUpDown className="ml-2 h-4 w-4 inline" />
            </TableHead>
            <TableHead className="text-lg uppercase">Registration</TableHead>
            <TableHead className="text-lg uppercase">Station</TableHead>
            <TableHead className="text-lg uppercase">Defect</TableHead>
            <TableHead className="text-lg uppercase">Remarks</TableHead>
            <TableHead className="text-lg uppercase">ETA</TableHead>
            <TableHead className="text-lg uppercase">STD</TableHead>
            <TableHead className="text-lg uppercase">UPD</TableHead>
            <TableHead className="text-lg uppercase">RST</TableHead>
            <TableHead className="text-lg uppercase">SL</TableHead>
            <TableHead className="text-lg uppercase">OK</TableHead>
            <TableHead className="text-lg uppercase">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-8 text-lg text-gray-500">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow 
                key={record.id} 
                className="table-animation"
                style={{
                  backgroundColor: record.ok ? "#F2FCE2" : record.sl ? "#FEF7CD" : "transparent"
                }}
              >
                <TableCell className="text-lg uppercase">
                  {format(new Date(record.date), 'dd/MM/yyyy')} {record.time}
                </TableCell>
                <TableCell className="text-lg uppercase">{record.registration}</TableCell>
                <TableCell className="text-lg uppercase">{record.station}</TableCell>
                <TableCell className="text-lg uppercase">{record.defect}</TableCell>
                <TableCell className="text-lg uppercase">{record.remarks}</TableCell>
                <TableCell className="text-lg uppercase">{record.eta}</TableCell>
                <TableCell className="text-lg uppercase">{record.std}</TableCell>
                <TableCell className="text-lg uppercase">{record.upd}</TableCell>
                <TableCell className="text-lg uppercase text-center">{record.rst ? "YES" : "NO"}</TableCell>
                <TableCell className="text-lg uppercase text-center">{record.sl ? "YES" : "NO"}</TableCell>
                <TableCell className="text-lg uppercase text-center">{record.ok ? "YES" : "NO"}</TableCell>
                <TableCell>
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
