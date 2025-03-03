import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { DefectRecord, FilterType } from "@/components/defect-records/DefectRecord.types";
import { FilterButtons } from "@/components/defect-records/FilterButtons";
import { RecordsTable } from "@/components/defect-records/RecordsTable";
import { AddDefectModal } from "@/components/defect-records/AddDefectModal";
import { EditDefectModal } from "@/components/defect-records/EditDefectModal";
import { exportToPdf, exportToExcel } from '@/utils/pdfExport';
import { getAllRecords, saveRecord, deleteRecord, deleteRecordsByDate, saveRecords } from '@/utils/firebaseDB';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [records, setRecords] = useState<DefectRecord[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({
    key: 'time',
    direction: 'desc'
  });
  const [editingRecord, setEditingRecord] = useState<DefectRecord | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const { toast } = useToast();

  const initialFormState = {
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    registration: '',
    station: '',
    defect: '',
    remarks: '',
    eta: '',
    std: '',
    upd: '',
    rst: false,
    sl: false,
    ok: false,
    pln: false,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const loadedRecords = await getAllRecords();
        // Sort records by time with newest at the bottom (ascending order)
        const sortedRecords = [...loadedRecords].sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
        setRecords(sortedRecords);
      } catch (error) {
        console.error('Failed to load records:', error);
        toast({
          title: "ERROR",
          description: "FAILED TO LOAD RECORDS",
          variant: "destructive",
        });
      }
    };

    loadRecords();
  }, []);

  const handleSort = (column: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: column, direction });
    
    const sortedRecords = [...records].sort((a, b) => {
      if (column === 'time') {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      }
      
      // For string columns like registration and station
      if (!a[column as keyof DefectRecord] || !b[column as keyof DefectRecord]) {
        return 0;
      }
      
      const valueA = String(a[column as keyof DefectRecord]).toUpperCase();
      const valueB = String(b[column as keyof DefectRecord]).toUpperCase();
      
      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setRecords(sortedRecords);
    
    saveRecords(sortedRecords).catch(error => {
      console.error('Failed to save sorted records:', error);
    });
  };

  const handleSubmit = async () => {
    if (!formData.registration || !formData.station || !formData.defect) {
      toast({
        title: "VALIDATION ERROR",
        description: "PLEASE FILL IN ALL REQUIRED FIELDS",
        variant: "destructive",
      });
      return;
    }

    if (formData.registration.length > 6 || formData.station.length > 6) {
      toast({
        title: "VALIDATION ERROR",
        description: "REGISTRATION AND STATION MUST BE 6 CHARACTERS OR LESS",
        variant: "destructive",
      });
      return;
    }

    const newRecord: DefectRecord = {
      id: Date.now().toString(),
      ...formData,
    };

    try {
      await saveRecord(newRecord);
      
      // Add the new record and sort by time to keep newest at the bottom
      setRecords(prev => {
        const updatedRecords = [...prev, newRecord].sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA.getTime() - dateB.getTime(); // Ascending order (oldest to newest)
        });
        return updatedRecords;
      });

      toast({
        title: "SUCCESS",
        description: "DEFECT RECORD HAS BEEN SAVED",
      });

      setFormData(initialFormState);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save record:', error);
      toast({
        title: "ERROR",
        description: "FAILED TO SAVE RECORD",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async () => {
    if (!editingRecord) return;

    if (!editingRecord.registration || !editingRecord.station || !editingRecord.defect) {
      toast({
        title: "VALIDATION ERROR",
        description: "PLEASE FILL IN ALL REQUIRED FIELDS",
        variant: "destructive",
      });
      return;
    }

    if (editingRecord.registration.length > 6 || editingRecord.station.length > 6) {
      toast({
        title: "VALIDATION ERROR",
        description: "REGISTRATION AND STATION MUST BE 6 CHARACTERS OR LESS",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveRecord(editingRecord);
      
      setRecords(prev => 
        prev.map(record => 
          record.id === editingRecord.id ? editingRecord : record
        ).sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return sortConfig.direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        })
      );

      toast({
        title: "SUCCESS",
        description: "DEFECT RECORD HAS BEEN UPDATED",
      });

      setEditingRecord(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update record:', error);
      toast({
        title: "ERROR",
        description: "FAILED TO UPDATE RECORD",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setFormData(initialFormState);
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteRecord(id);
      
      setRecords(prev => prev.filter(record => record.id !== id));
      
      toast({
        title: "SUCCESS",
        description: "DEFECT RECORD HAS BEEN DELETED",
      });
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast({
        title: "ERROR",
        description: "FAILED TO DELETE RECORD",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllByDate = async (date: string) => {
    try {
      await deleteRecordsByDate(date);
      
      setRecords(prev => prev.filter(record => record.date !== date));
      
      toast({
        title: "SUCCESS",
        description: `ALL RECORDS FOR ${format(new Date(date), 'dd/MM/yyyy')} HAVE BEEN DELETED`,
      });
    } catch (error) {
      console.error('Failed to delete records by date:', error);
      toast({
        title: "ERROR",
        description: "FAILED TO DELETE RECORDS",
        variant: "destructive",
      });
    }
  };

  const handleEditRecord = (record: DefectRecord) => {
    setEditingRecord({...record});
    setIsEditModalOpen(true);
  };

  const handleExportToPdf = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "WARNING",
        description: "NO RECORDS TO EXPORT",
        variant: "destructive",
      });
      return;
    }
    exportToPdf(filteredRecords);
  };

  const handleExportToExcel = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "WARNING",
        description: "NO RECORDS TO EXPORT",
        variant: "destructive",
      });
      return;
    }
    exportToExcel(filteredRecords);
  };

  const filteredRecords = records.filter(record => {
    if (filter === 'all') return true;
    if (filter === 'sl') return record.sl && !record.ok;
    if (filter === 'ok') return record.ok && !record.sl;
    if (filter === 'sl-ok') return record.sl && record.ok;
    return true;
  });

  return (
    <div className="w-full px-4 py-8 fade-in">
      <div className="flex justify-between items-center mb-8 max-w-[1920px] mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 uppercase">Aircraft Defect Records</h1>
        <div className="flex gap-4">
          <FilterButtons 
            filter={filter} 
            setFilter={setFilter} 
            exportToPdf={handleExportToPdf}
            exportToExcel={handleExportToExcel}
          />
          <Button 
            onClick={() => {
              setFormData(initialFormState);
              setIsModalOpen(true);
            }}
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors text-lg uppercase"
          >
            Record Defect
          </Button>
        </div>
      </div>

      <AddDefectModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        formData={formData}
        setFormData={setFormData}
        handleClear={handleClear}
        handleSubmit={handleSubmit}
      />

      <EditDefectModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        editingRecord={editingRecord}
        setEditingRecord={setEditingRecord}
        handleEditSubmit={handleEditSubmit}
      />

      <RecordsTable
        records={filteredRecords}
        handleSort={handleSort}
        handleEditRecord={handleEditRecord}
        handleDeleteRecord={handleDeleteRecord}
        handleDeleteAllByDate={handleDeleteAllByDate}
        sortConfig={sortConfig}
      />
    </div>
  );
};

export default Index;
