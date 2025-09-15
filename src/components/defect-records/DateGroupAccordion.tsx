import { Button } from "@/components/ui/button";
import { Table, TableBody } from "@/components/ui/table";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Archive, Trash2 } from "lucide-react";
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
  handleUpdateRecord: (id: string, updates: Partial<DefectRecord>) => void;
  handleToggleVisibility: (record: DefectRecord) => void;
  handleDeleteAllByDate: (date: string) => void;
  handleArchiveDate: (date: string) => void;
  handleSort: (column: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  currentTime: Date;
  isArchiveView?: boolean; // Add optional isArchiveView prop
}

export const DateGroupAccordion = ({
  group,
  handleEditRecord,
  handleDeleteRecord,
  handleUpdateRecord,
  handleToggleVisibility,
  handleDeleteAllByDate,
  handleArchiveDate,
  handleSort,
  sortConfig,
  currentTime,
  isArchiveView = false, // Default to false
}: DateGroupAccordionProps) => {
  return (
    <AccordionItem
      key={group.date}
      value={group.date}
      className="border-b border-slate-300"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-slate-200">
        <AccordionTrigger className="text-xl font-semibold py-0 text-slate-800 hover:text-slate-900">
          {group.formattedDate} ({group.records.length} Records)
        </AccordionTrigger>
        <div className="flex space-x-2">
          {/* Only render the Archive button if not in archive view */}
          {!isArchiveView && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (
                  window.confirm(
                    `Archive all records for ${group.formattedDate}? They will be hidden from view.`
                  )
                ) {
                  handleArchiveDate(group.date);
                }
              }}
              className="h-8 flex items-center gap-1"
            >
              <Archive className="h-4 w-4" />
              <span>Archive</span>
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (
                window.confirm(`Delete all records for ${group.formattedDate}?`)
              ) {
                handleDeleteAllByDate(group.date);
              }
            }}
            className="h-8 flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete All</span>
          </Button>
        </div>
      </div>
      <AccordionContent className="bg-white">
        <Table
          className="w-full defect-records-table"
          style={{
            tableLayout: "fixed",
            width: "100%",
            borderCollapse: "collapse",
            borderSpacing: 0,
          }}
        >
          <DefectTableHeader handleSort={handleSort} sortConfig={sortConfig} />
          <TableBody>
            {group.records.map((record) => (
              <RecordRow
                key={record.id}
                record={record}
                handleEditRecord={handleEditRecord}
                handleDeleteRecord={handleDeleteRecord}
                handleUpdateRecord={handleUpdateRecord}
                handleToggleVisibility={handleToggleVisibility}
                currentTime={currentTime}
              />
            ))}
          </TableBody>
        </Table>
      </AccordionContent>
    </AccordionItem>
  );
};
