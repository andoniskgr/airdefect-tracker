
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { DefectRecord, FilterType } from "@/components/defect-records/DefectRecord.types";
import { FilterButtons } from "@/components/defect-records/FilterButtons";
import { RecordsTable } from "@/components/defect-records/RecordsTable";
import { AddDefectModal } from "@/components/defect-records/AddDefectModal";
import { EditDefectModal } from "@/components/defect-records/EditDefectModal";
import { exportToPdf } from '@/utils/pdfExport';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [records, setRecords] = useState<DefectRecord[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
  };

  const [formData, setFormData] = useState(initialFormState);
  const [timeInput, setTimeInput] = useState(format(new Date(), 'HH:mm'));
  const [etaTimeInput, setEtaTimeInput] = useState('');
  const [stdTimeInput, setStdTimeInput] = useState('');
  const [updTimeInput, setUpdTimeInput] = useState('');

  const openTimePicker = (field: string) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    switch(field) {
      case 'time':
        setTimeInput(`${hours}:${minutes}`);
        setFormData(prev => ({ ...prev, time: `${hours}:${minutes}` }));
        break;
      case 'eta':
        setEtaTimeInput(`${hours}:${minutes}`);
        setFormData(prev => ({ ...prev, eta: `${hours}:${minutes}` }));
        break;
      case 'std':
        setStdTimeInput(`${hours}:${minutes}`);
        setFormData(prev => ({ ...prev, std: `${hours}:${minutes}` }));
        break;
      case 'upd':
        setUpdTimeInput(`${hours}:${minutes}`);
        setFormData(prev => ({ ...prev, upd: `${hours}:${minutes}` }));
        break;
    }
  };

  const handleTimeChange = (field: string, value: string) => {
    // Only allow numbers and format them
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 4) {
      const hours = numbers.slice(0, 2);
      const minutes = numbers.slice(2, 4);
      
      let formattedTime = '';
      if (hours) {
        const hoursNum = parseInt(hours);
        if (hoursNum >= 24) {
          formattedTime = '23:';
        } else {
          formattedTime = hours.padStart(2, '0') + ':';
        }
        
        if (minutes) {
          const minutesNum = parseInt(minutes);
          if (minutesNum >= 60) {
            formattedTime += '59';
          } else {
            formattedTime += minutes.padStart(2, '0');
          }
        } else if (numbers.length > 2) {
          formattedTime += '00';
        }
      }
      
      if (formattedTime && formattedTime.includes(':') || formattedTime === '') {
        switch(field) {
          case 'time':
            setTimeInput(formattedTime);
            setFormData(prev => ({ ...prev, time: formattedTime }));
            break;
          case 'eta':
            setEtaTimeInput(formattedTime);
            setFormData(prev => ({ ...prev, eta: formattedTime }));
            break;
          case 'std':
            setStdTimeInput(formattedTime);
            setFormData(prev => ({ ...prev, std: formattedTime }));
            break;
          case 'upd':
            setUpdTimeInput(formattedTime);
            setFormData(prev => ({ ...prev, upd: formattedTime }));
            break;
        }
      }
    }
  };

  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sortedRecords = [...records].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return newOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    setRecords(sortedRecords);
  };

  const handleSubmit = () => {
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

    setRecords(prev => [...prev, newRecord].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }));

    toast({
      title: "SUCCESS",
      description: "DEFECT RECORD HAS BEEN SAVED",
    });

    setFormData(initialFormState);
    resetInputs();
    setIsModalOpen(false);
  };

  const handleEditSubmit = () => {
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

    setRecords(prev => 
      prev.map(record => 
        record.id === editingRecord.id ? editingRecord : record
      ).sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      })
    );

    toast({
      title: "SUCCESS",
      description: "DEFECT RECORD HAS BEEN UPDATED",
    });

    setEditingRecord(null);
    setIsEditModalOpen(false);
  };

  const handleClear = () => {
    setFormData(initialFormState);
    resetInputs();
  };

  const resetInputs = () => {
    setTimeInput('');
    setEtaTimeInput('');
    setStdTimeInput('');
    setUpdTimeInput('');
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
    toast({
      title: "SUCCESS",
      description: "DEFECT RECORD HAS BEEN DELETED",
    });
  };

  const handleEditRecord = (record: DefectRecord) => {
    setEditingRecord({...record});
    setIsEditModalOpen(true);
    
    // Set fields for editing
    setTimeInput(record.time || '');
    setEtaTimeInput(record.eta || '');
    setStdTimeInput(record.std || '');
    setUpdTimeInput(record.upd || '');
  };

  const handleEditingTimeChange = (field: string, value: string) => {
    if (!editingRecord) return;

    // Only allow numbers and format them
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 4) {
      const hours = numbers.slice(0, 2);
      const minutes = numbers.slice(2, 4);
      
      let formattedTime = '';
      if (hours) {
        const hoursNum = parseInt(hours);
        if (hoursNum >= 24) {
          formattedTime = '23:';
        } else {
          formattedTime = hours.padStart(2, '0') + ':';
        }
        
        if (minutes) {
          const minutesNum = parseInt(minutes);
          if (minutesNum >= 60) {
            formattedTime += '59';
          } else {
            formattedTime += minutes.padStart(2, '0');
          }
        } else if (numbers.length > 2) {
          formattedTime += '00';
        }
      }
      
      if (formattedTime && formattedTime.includes(':') || formattedTime === '') {
        switch(field) {
          case 'time':
            setTimeInput(formattedTime);
            setEditingRecord({ ...editingRecord, time: formattedTime });
            break;
          case 'eta':
            setEtaTimeInput(formattedTime);
            setEditingRecord({ ...editingRecord, eta: formattedTime });
            break;
          case 'std':
            setStdTimeInput(formattedTime);
            setEditingRecord({ ...editingRecord, std: formattedTime });
            break;
          case 'upd':
            setUpdTimeInput(formattedTime);
            setEditingRecord({ ...editingRecord, upd: formattedTime });
            break;
        }
      }
    }
  };

  const handleExportToPdf = () => {
    exportToPdf(filteredRecords);
  };

  const filteredRecords = records.filter(record => {
    if (filter === 'all') return true;
    if (filter === 'sl') return record.sl;
    if (filter === 'ok') return record.ok;
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
          />
          <Button 
            onClick={() => {
              setFormData(initialFormState);
              resetInputs();
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
        timeInput={timeInput}
        setTimeInput={setTimeInput}
        etaTimeInput={etaTimeInput}
        setEtaTimeInput={setEtaTimeInput}
        stdTimeInput={stdTimeInput}
        setStdTimeInput={setStdTimeInput}
        updTimeInput={updTimeInput}
        setUpdTimeInput={setUpdTimeInput}
        handleTimeChange={handleTimeChange}
        openTimePicker={openTimePicker}
        handleClear={handleClear}
        handleSubmit={handleSubmit}
      />

      <EditDefectModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        editingRecord={editingRecord}
        setEditingRecord={setEditingRecord}
        timeInput={timeInput}
        setTimeInput={setTimeInput}
        etaTimeInput={etaTimeInput}
        setEtaTimeInput={setEtaTimeInput}
        stdTimeInput={stdTimeInput}
        setStdTimeInput={setStdTimeInput}
        updTimeInput={updTimeInput}
        setUpdTimeInput={setUpdTimeInput}
        handleEditingTimeChange={handleEditingTimeChange}
        handleEditSubmit={handleEditSubmit}
      />

      <RecordsTable
        records={filteredRecords}
        handleSort={handleSort}
        handleEditRecord={handleEditRecord}
        handleDeleteRecord={handleDeleteRecord}
      />
    </div>
  );
};

export default Index;
