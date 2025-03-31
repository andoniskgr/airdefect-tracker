
import { useState } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Archive, Trash } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody } from "@/components/ui/table";
import { DefectRecord } from "./DefectRecord.types";
import { DefectTableHeader } from "./TableHeader";
import { RecordRow } from "./RecordRow";

interface DateGroupProps {
  date: string;
  formattedDate: string;
  records: DefectRecord[];
}

interface DateGroupAccordionProps {
  group: DateGroupProps;
  handleEditRecord: (record: DefectRecord) => void;
  handleDeleteRecord: (id: string) => void;
  handleDeleteAllByDate: (date: string) => void;
  handleArchiveDate: (date: string) => void;
  handleSort: (column: string) => void;
  sortConfig: { key: string, direction: 'asc' | 'desc' };
  currentTime: Date;
  isArchiveView?: boolean; // Add isArchiveView prop
}

export const DateGroupAccordion = ({
  group,
  handleEditRecord,
  handleDeleteRecord,
  handleDeleteAllByDate,
  handleArchiveDate,
  handleSort,
  sortConfig,
  currentTime,
  isArchiveView = false // Default to false
}: DateGroupAccordionProps) => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isArchiveAlertOpen, setIsArchiveAlertOpen] = useState(false);

  const totalNXS = group.records.filter(record => record.nxs).length;
  const totalOK = group.records.filter(record => record.ok).length;
  const totalRecords = group.records.length;
  const completionPercentage = totalRecords > 0 ? Math.round((totalOK / totalRecords) * 100) : 0;
  
  const handleDelete = () => {
    handleDeleteAllByDate(group.date);
    setIsDeleteAlertOpen(false);
  };
  
  const handleArchive = () => {
    handleArchiveDate(group.date);
    setIsArchiveAlertOpen(false);
  };

  return (
    <AccordionItem value={group.date} className="border-b border-gray-200">
      <AccordionTrigger className="px-4 py-3 bg-gray-100 hover:bg-gray-200 flex items-center justify-between w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-left">
          <span className="font-bold text-slate-800">
            {group.formattedDate}
          </span>
          <div className="flex gap-2 text-sm">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
              Total: {totalRecords}
            </span>
            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md">
              NXS: {totalNXS}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md">
              OK: {totalOK} ({completionPercentage}%)
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="p-2 md:p-4">
          <div className="flex justify-end gap-2 mb-4">
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all records from {group.formattedDate}.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Yes, delete all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {/* Only show Archive button if not in archive view */}
            {!isArchiveView && (
              <AlertDialog open={isArchiveAlertOpen} onOpenChange={setIsArchiveAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Archive records?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will archive all records from {group.formattedDate}.
                      Archived records can be viewed in the Archive section.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleArchive}>
                      Yes, archive
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <DefectTableHeader handleSort={handleSort} sortConfig={sortConfig} />
              <TableBody>
                {group.records.map((record) => (
                  <RecordRow
                    key={record.id}
                    record={record}
                    currentTime={currentTime}
                    onEdit={() => handleEditRecord(record)}
                    onDelete={() => handleDeleteRecord(record.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
