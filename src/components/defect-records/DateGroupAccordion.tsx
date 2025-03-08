
import { Button } from "@/components/ui/button";
import { Table, TableBody } from "@/components/ui/table";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2 } from "lucide-react";
import { DefectRecord } from "./DefectRecord.types";
import { RecordRow } from "./RecordRow";
import { DefectTableHeader } from "./TableHeader";

interface DateGroup {
  date: string;
  formattedDate: string;
  records: DefectRecord[];
}

interface DateGroupAccordionProps {
  group: DateGroup;
  handleEditRecord: (record: DefectRecord) => void;
  handleDeleteRecord: (id: string) => void;
  handleDeleteAllByDate: (date: string) => void;
  handleSort: (column: string) => void;
  sortConfig: { key: string, direction: 'asc' | 'desc' };
  currentTime: Date;
}

export const DateGroupAccordion = ({
  group,
  handleEditRecord,
  handleDeleteRecord,
  handleDeleteAllByDate,
  handleSort,
  sortConfig,
  currentTime
}: DateGroupAccordionProps) => {
  return (
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
          <DefectTableHeader 
            handleSort={handleSort} 
            sortConfig={sortConfig} 
          />
          <TableBody>
            {group.records.map((record) => (
              <RecordRow 
                key={record.id}
                record={record} 
                handleEditRecord={handleEditRecord} 
                handleDeleteRecord={handleDeleteRecord}
                currentTime={currentTime}
              />
            ))}
          </TableBody>
        </Table>
      </AccordionContent>
    </AccordionItem>
  );
};
