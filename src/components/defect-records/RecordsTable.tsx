
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash, ChevronDown } from "lucide-react";
import { format, isToday, isSameDay, parseISO } from 'date-fns';
import { DefectRecord } from "./DefectRecord.types";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";

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
  const [groupedRecords, setGroupedRecords] = useState<Record<string, DefectRecord[]>>({});
  const [flashingIds, setFlashingIds] = useState<Set<string>>(new Set());

  // Group records by date
  useEffect(() => {
    const grouped: Record<string, DefectRecord[]> = {};
    
    records.forEach(record => {
      const dateKey = record.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(record);
    });
    
    setGroupedRecords(grouped);
  }, [records]);

  // Check for records that need to flash
  useEffect(() => {
    const currentTime = new Date();
    const currentTimeString = format(currentTime, 'HH:mm');
    const idsToFlash = new Set<string>();

    records.forEach(record => {
      // Flash if UPD exists, not OK, and current time is same or later than UPD
      if (record.upd && !record.ok && currentTimeString >= record.upd) {
        idsToFlash.add(record.id);
      }
    });

    setFlashingIds(idsToFlash);

    // Set up interval to continue checking
    const intervalId = setInterval(() => {
      setFlashingIds(prev => new Set(prev));
    }, 500);

    return () => clearInterval(intervalId);
  }, [records]);

  // Sort dates for display
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return "TODAY";
    }
    return format(date, 'dd/MM/yyyy');
  };

  const renderTableContent = (dateRecords: DefectRecord[]) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer text-lg uppercase" onClick={handleSort}>
              Time
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
          {dateRecords.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-8 text-lg text-gray-500">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            dateRecords.map((record) => (
              <TableRow 
                key={record.id} 
                className={`table-animation ${flashingIds.has(record.id) ? 'flashing-row' : ''}`}
                style={{
                  backgroundColor: record.ok ? "#F2FCE2" : record.sl ? "#FEF7CD" : "transparent"
                }}
              >
                <TableCell className="text-lg uppercase">
                  {record.time}
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
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border max-w-[1920px] mx-auto">
      {records.length === 0 ? (
        <div className="text-center py-8 text-xl text-gray-500">
          No records found
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={sortedDates} className="w-full">
          {sortedDates.map(date => (
            <AccordionItem key={date} value={date} className="border-b">
              <AccordionTrigger className="bg-gray-100 px-4 py-2 text-xl font-medium uppercase">
                {formatDateDisplay(date)}
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-500" />
              </AccordionTrigger>
              <AccordionContent className="px-1 py-2">
                {renderTableContent(groupedRecords[date])}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};
