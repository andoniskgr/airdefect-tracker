
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowUpDown, Pencil, Trash } from "lucide-react";
import { format, isToday, parseISO, isSameDay } from 'date-fns';
import { DefectRecord } from "./DefectRecord.types";
import { useState, useEffect } from "react";

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
  // Group records by date
  const groupRecordsByDate = () => {
    const groups: { [key: string]: DefectRecord[] } = {};
    
    records.forEach(record => {
      const dateKey = format(new Date(record.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(record);
    });
    
    // Sort date keys in descending order (newest first)
    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(dateKey => ({
        date: dateKey,
        formattedDate: format(new Date(dateKey), 'dd/MM/yyyy'),
        records: groups[dateKey]
      }));
  };

  const groupedRecords = groupRecordsByDate();
  
  // Check if a record needs to flash based on UPD value
  const shouldFlash = (record: DefectRecord) => {
    if (!record.upd || record.ok) {
      return false;
    }
    
    const now = new Date();
    const updTime = new Date(`${record.date}T${record.upd}:00`);
    
    return now >= updTime;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border max-w-[1920px] mx-auto">
      {records.length === 0 ? (
        <div className="text-center py-8 text-lg text-gray-500">
          No records found
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={[groupedRecords[0]?.date]}>
          {groupedRecords.map(group => (
            <AccordionItem key={group.date} value={group.date}>
              <AccordionTrigger className="px-4 py-2 text-lg font-medium bg-secondary/50">
                {group.formattedDate} ({group.records.length} Records)
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-lg uppercase">Time</TableHead>
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
                    {group.records.map((record) => (
                      <TableRow 
                        key={record.id} 
                        className={`table-animation ${shouldFlash(record) ? 'flash-record' : ''}`}
                        style={{
                          backgroundColor: record.ok ? "#F2FCE2" : record.sl ? "#FEF7CD" : "transparent"
                        }}
                      >
                        <TableCell className="text-lg uppercase">{record.time}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};
