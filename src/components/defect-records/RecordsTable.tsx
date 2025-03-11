
import { Accordion } from "@/components/ui/accordion";
import { format } from 'date-fns';
import { DefectRecord } from "./DefectRecord.types";
import { useState, useEffect } from "react";
import { DateGroupAccordion } from "./DateGroupAccordion";

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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const groupRecordsByDate = () => {
    const groups: { [key: string]: DefectRecord[] } = {};
    
    records.forEach(record => {
      const dateKey = format(new Date(record.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(record);
    });
    
    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(dateKey => ({
        date: dateKey,
        formattedDate: format(new Date(dateKey), 'dd/MM/yyyy'),
        records: groups[dateKey]
      }));
  };

  const groupedRecords = groupRecordsByDate();

  return (
    <div className="bg-white rounded-lg shadow-lg border w-full mx-auto overflow-hidden">
      {records.length === 0 ? (
        <div className="text-center py-8 text-lg text-gray-500 bg-white">
          No records found
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={[groupedRecords[0]?.date]} className="bg-white">
          {groupedRecords.map(group => (
            <DateGroupAccordion
              key={group.date}
              group={group}
              handleEditRecord={handleEditRecord}
              handleDeleteRecord={handleDeleteRecord}
              handleDeleteAllByDate={handleDeleteAllByDate}
              handleSort={handleSort}
              sortConfig={sortConfig}
              currentTime={currentTime}
            />
          ))}
        </Accordion>
      )}
    </div>
  );
};
