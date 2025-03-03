
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowUpDown, Pencil, Trash, Trash2 } from "lucide-react";
import { format, isToday, parseISO, isSameDay } from 'date-fns';
import { DefectRecord } from "./DefectRecord.types";
import { useState, useEffect } from "react";

interface RecordsTableProps {
  records: DefectRecord[];
  handleSort: (column: string) => void;
  handleEditRecord: (record: DefectRecord) => void;
  handleDeleteRecord: (id: string) => void;
  handleDeleteAllByDate: (date: string) => void;
  sortConfig: { key: string, direction: 'asc' | 'desc' };
}

export const RecordsTable = ({ 
  records, 
  handleSort, 
  handleEditRecord, 
  handleDeleteRecord,
  handleDeleteAllByDate,
  sortConfig
}: RecordsTableProps) => {
  // State to trigger re-renders for UPD time checks
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update the current time every minute to check UPD times
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
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
  
  // Check if a UPD value needs to flash based on time
  const shouldFlashUpd = (record: DefectRecord) => {
    if (!record.upd || record.ok) {
      return false;
    }
    
    const now = currentTime;
    try {
      // Using a different approach to parsing time that's more reliable
      const [hours, minutes] = record.upd.split(':').map(Number);
      const updTime = new Date();
      updTime.setHours(hours, minutes, 0, 0);
      
      return now >= updTime;
    } catch (error) {
      console.error('Error parsing UPD time:', error);
      return false;
    }
  };

  // Sort indicator for table headers
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
              <div className="flex items-center justify-between px-4 py-2 bg-secondary/50">
                <AccordionTrigger className="text-lg font-medium py-0">
                  {group.formattedDate} ({group.records.length} Records)
                </AccordionTrigger>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete all records for ${group.formattedDate}?`)) {
                      handleDeleteAllByDate(group.date);
                    }
                  }}
                  className="h-8 flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete All</span>
                </Button>
              </div>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-lg uppercase cursor-pointer" onClick={() => handleSort('time')}>
                        Time <ArrowUpDown className="inline h-4 w-4 ml-1" /> {getSortIndicator('time')}
                      </TableHead>
                      <TableHead className="text-lg uppercase cursor-pointer" onClick={() => handleSort('registration')}>
                        Registration <ArrowUpDown className="inline h-4 w-4 ml-1" /> {getSortIndicator('registration')}
                      </TableHead>
                      <TableHead className="text-lg uppercase cursor-pointer" onClick={() => handleSort('station')}>
                        Station <ArrowUpDown className="inline h-4 w-4 ml-1" /> {getSortIndicator('station')}
                      </TableHead>
                      <TableHead className="text-lg uppercase">Defect</TableHead>
                      <TableHead className="text-lg uppercase">Remarks</TableHead>
                      <TableHead className="text-lg uppercase">ETA</TableHead>
                      <TableHead className="text-lg uppercase">STD</TableHead>
                      <TableHead className="text-lg uppercase">UPD</TableHead>
                      <TableHead className="text-lg uppercase">RST</TableHead>
                      <TableHead className="text-lg uppercase">SL</TableHead>
                      <TableHead className="text-lg uppercase">OK</TableHead>
                      <TableHead className="text-lg uppercase">PLN</TableHead>
                      <TableHead className="text-lg uppercase">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.records.map((record) => (
                      <TableRow 
                        key={record.id} 
                        className="table-animation"
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
                        <TableCell className={`text-lg uppercase ${shouldFlashUpd(record) ? 'flash-upd' : ''}`}>
                          {record.upd}
                        </TableCell>
                        <TableCell className="text-lg uppercase text-center">{record.rst ? "YES" : "NO"}</TableCell>
                        <TableCell className="text-lg uppercase text-center">{record.sl ? "YES" : "NO"}</TableCell>
                        <TableCell className="text-lg uppercase text-center">{record.ok ? "YES" : "NO"}</TableCell>
                        <TableCell className="text-lg uppercase text-center">{record.pln ? "YES" : "NO"}</TableCell>
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
