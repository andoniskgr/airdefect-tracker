
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowUpDown, Pencil, Trash, Trash2, Save, X } from "lucide-react";
import { format, isToday, parseISO, isSameDay } from 'date-fns';
import { DefectRecord } from "./DefectRecord.types";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface RecordsTableProps {
  records: DefectRecord[];
  handleSort: (column: string) => void;
  handleEditRecord: (record: DefectRecord) => void;
  handleSaveRecord: (record: DefectRecord) => void;
  handleDeleteRecord: (id: string) => void;
  handleDeleteAllByDate: (date: string) => void;
  sortConfig: { key: string, direction: 'asc' | 'desc' };
}

export const RecordsTable = ({ 
  records, 
  handleSort, 
  handleEditRecord,
  handleSaveRecord,
  handleDeleteRecord,
  handleDeleteAllByDate,
  sortConfig
}: RecordsTableProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedRecord, setEditedRecord] = useState<DefectRecord | null>(null);

  // Update current time every minute to check for UPD values that need to flash
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
    
    const recordDate = new Date(record.date);
    const updTime = new Date(`${record.date}T${record.upd}:00`);
    
    return currentTime >= updTime;
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

  const startEditing = (record: DefectRecord) => {
    setEditingId(record.id);
    setEditedRecord({...record});
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedRecord(null);
  };

  const saveEditing = () => {
    if (editedRecord) {
      handleSaveRecord(editedRecord);
      setEditingId(null);
      setEditedRecord(null);
    }
  };

  const handleInputChange = (field: keyof DefectRecord, value: string | boolean) => {
    if (editedRecord) {
      setEditedRecord({
        ...editedRecord,
        [field]: value
      });
    }
  };

  const renderEditableCell = (record: DefectRecord, field: keyof DefectRecord, type: 'text' | 'checkbox' = 'text') => {
    const isEditing = editingId === record.id;
    
    if (isEditing && editedRecord) {
      if (type === 'checkbox') {
        return (
          <div className="flex justify-center">
            <Checkbox 
              checked={editedRecord[field] as boolean} 
              onCheckedChange={(checked) => handleInputChange(field, !!checked)}
            />
          </div>
        );
      } else {
        return (
          <Input
            value={editedRecord[field] as string}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="h-8 text-lg uppercase"
          />
        );
      }
    } else {
      if (type === 'checkbox') {
        return <div className="text-center">{record[field] ? "YES" : "NO"}</div>;
      } else {
        return record[field];
      }
    }
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
                        <TableCell className="text-lg uppercase">
                          {renderEditableCell(record, 'time')}
                        </TableCell>
                        <TableCell className="text-lg uppercase">
                          {renderEditableCell(record, 'registration')}
                        </TableCell>
                        <TableCell className="text-lg uppercase">
                          {renderEditableCell(record, 'station')}
                        </TableCell>
                        <TableCell className="text-lg uppercase">
                          {renderEditableCell(record, 'defect')}
                        </TableCell>
                        <TableCell className="text-lg uppercase">
                          {renderEditableCell(record, 'remarks')}
                        </TableCell>
                        <TableCell className="text-lg uppercase">
                          {renderEditableCell(record, 'eta')}
                        </TableCell>
                        <TableCell className="text-lg uppercase">
                          {renderEditableCell(record, 'std')}
                        </TableCell>
                        <TableCell className={`text-lg uppercase ${shouldFlashUpd(record) ? 'flash-upd' : ''}`}>
                          {renderEditableCell(record, 'upd')}
                        </TableCell>
                        <TableCell className="text-lg uppercase text-center">
                          {renderEditableCell(record, 'rst', 'checkbox')}
                        </TableCell>
                        <TableCell className="text-lg uppercase text-center">
                          {renderEditableCell(record, 'sl', 'checkbox')}
                        </TableCell>
                        <TableCell className="text-lg uppercase text-center">
                          {renderEditableCell(record, 'ok', 'checkbox')}
                        </TableCell>
                        <TableCell className="text-lg uppercase text-center">
                          {renderEditableCell(record, 'pln', 'checkbox')}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {editingId === record.id ? (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={saveEditing}
                                  className="p-2 h-8 w-8"
                                >
                                  <Save className="h-4 w-4" />
                                  <span className="sr-only">Save</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={cancelEditing}
                                  className="p-2 h-8 w-8"
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Cancel</span>
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => startEditing(record)}
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
                              </>
                            )}
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
