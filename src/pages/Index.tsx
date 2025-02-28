
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { ArrowUpDown, Pencil, Trash, X, Check, FileDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import html2pdf from 'html2pdf.js';

interface DefectRecord {
  id: string;
  date: string;
  time: string;
  registration: string;
  station: string;
  defect: string;
  remarks: string;
  eta: string;
  std: string;
  upd: string;
  rst: boolean;
  sl: boolean;
  ok: boolean;
}

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [records, setRecords] = useState<DefectRecord[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingRecord, setEditingRecord] = useState<DefectRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'sl' | 'ok'>('all');
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

  const exportToPdf = () => {
    // Create a temporary hidden div for the PDF export
    const exportDiv = document.createElement('div');
    exportDiv.style.position = 'absolute';
    exportDiv.style.left = '-9999px';
    exportDiv.className = 'pdf-export';
    
    // Create table HTML
    exportDiv.innerHTML = `
      <style>
        .pdf-table {
          width: 100%;
          border-collapse: collapse;
          font-family: Arial, sans-serif;
        }
        .pdf-table th {
          background-color: #f3f4f6;
          padding: 8px;
          text-align: left;
          font-weight: bold;
          border-bottom: 1px solid #e5e7eb;
        }
        .pdf-table td {
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .pdf-table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .pdf-table .ok-row {
          background-color: #F2FCE2;
        }
        .pdf-table .sl-row {
          background-color: #FEF7CD;
        }
      </style>
      <table class="pdf-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Registration</th>
            <th>Station</th>
            <th>Defect</th>
            <th>Remarks</th>
            <th>RST</th>
            <th>OK</th>
          </tr>
        </thead>
        <tbody>
          ${filteredRecords.map(record => `
            <tr class="${record.ok ? 'ok-row' : record.sl ? 'sl-row' : ''}">
              <td>${record.time}</td>
              <td>${record.registration}</td>
              <td>${record.station}</td>
              <td>${record.defect}</td>
              <td>${record.remarks}</td>
              <td>${record.rst ? 'YES' : 'NO'}</td>
              <td>${record.ok ? 'YES' : 'NO'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    document.body.appendChild(exportDiv);
    
    // Export to PDF using html2pdf
    const opt = {
      margin: 10,
      filename: 'aircraft_defect_records.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().from(exportDiv).set(opt).save().then(() => {
      // Clean up
      document.body.removeChild(exportDiv);
      
      toast({
        title: "SUCCESS",
        description: "PDF EXPORT COMPLETE",
      });
    });
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
          <div className="flex gap-2 items-center">
            <Button 
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              className="text-sm uppercase"
            >
              All
            </Button>
            <Button 
              onClick={() => setFilter('sl')}
              variant={filter === 'sl' ? 'default' : 'outline'}
              className="text-sm uppercase"
            >
              SL Only
            </Button>
            <Button 
              onClick={() => setFilter('ok')}
              variant={filter === 'ok' ? 'default' : 'outline'}
              className="text-sm uppercase"
            >
              OK Only
            </Button>
            <Button
              onClick={exportToPdf}
              variant="outline"
              className="text-sm uppercase ml-2"
            >
              <FileDown className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl uppercase">Record Aircraft Defect</DialogTitle>
            <DialogDescription className="sr-only">
              Enter defect details below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-lg font-medium mb-1 block uppercase">Date</label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[160px] justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        {formData.date ? format(new Date(formData.date), "dd/MM/yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date ? new Date(formData.date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({ ...formData, date: format(date, 'yyyy-MM-dd') });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div>
                <label className="text-lg font-medium mb-1 block uppercase">Time</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={timeInput}
                    onChange={(e) => handleTimeChange('time', e.target.value)}
                    placeholder="HH:MM"
                    className="text-lg uppercase w-[120px]"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="px-3"
                    onClick={() => openTimePicker('time')}
                  >
                    <span className="sr-only">Set current time</span>
                    <Clock />
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-lg font-medium mb-1 block uppercase">Registration</label>
                <Input
                  value={formData.registration}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    registration: e.target.value.toUpperCase().slice(0, 6)
                  }))}
                  placeholder="REGISTRATION"
                  className="text-lg uppercase w-[120px]"
                  maxLength={6}
                />
              </div>
              <div>
                <label className="text-lg font-medium mb-1 block uppercase">Station</label>
                <Input
                  value={formData.station}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    station: e.target.value.toUpperCase().slice(0, 6)
                  }))}
                  placeholder="STATION"
                  className="text-lg uppercase w-[120px]"
                  maxLength={6}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-lg font-medium mb-1 block uppercase">ETA</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={etaTimeInput}
                    onChange={(e) => handleTimeChange('eta', e.target.value)}
                    placeholder="HH:MM"
                    className="text-lg uppercase w-full"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="px-3"
                    onClick={() => openTimePicker('eta')}
                  >
                    <span className="sr-only">Set current time</span>
                    <Clock />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-lg font-medium mb-1 block uppercase">STD</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={stdTimeInput}
                    onChange={(e) => handleTimeChange('std', e.target.value)}
                    placeholder="HH:MM"
                    className="text-lg uppercase w-full"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="px-3"
                    onClick={() => openTimePicker('std')}
                  >
                    <span className="sr-only">Set current time</span>
                    <Clock />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-lg font-medium mb-1 block uppercase">UPD</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={updTimeInput}
                    onChange={(e) => handleTimeChange('upd', e.target.value)}
                    placeholder="HH:MM"
                    className="text-lg uppercase w-full"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="px-3"
                    onClick={() => openTimePicker('upd')}
                  >
                    <span className="sr-only">Set current time</span>
                    <Clock />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">Defect Description</label>
              <Input
                value={formData.defect}
                onChange={(e) => setFormData(prev => ({ ...prev, defect: e.target.value.toUpperCase() }))}
                placeholder="DESCRIPTION"
                className="text-lg uppercase"
              />
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">Remarks</label>
              <Input
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value.toUpperCase() }))}
                placeholder="REMARKS"
                className="text-lg uppercase"
              />
            </div>
            <div className="flex justify-center space-x-6 mt-2">
              <div className="flex flex-col items-center space-y-1">
                <Checkbox
                  id="sl"
                  checked={formData.sl}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, sl: checked as boolean }))
                  }
                  className="h-5 w-5"
                />
                <label htmlFor="sl" className="text-lg font-medium uppercase">
                  SL
                </label>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Checkbox
                  id="rst"
                  checked={formData.rst}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rst: checked as boolean }))
                  }
                  className="h-5 w-5"
                />
                <label htmlFor="rst" className="text-lg font-medium uppercase">
                  RST
                </label>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Checkbox
                  id="ok"
                  checked={formData.ok}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, ok: checked as boolean }))
                  }
                  className="h-5 w-5"
                />
                <label htmlFor="ok" className="text-lg font-medium uppercase">
                  OK
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleClear} className="text-lg uppercase">
              Clear
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setIsModalOpen(false)}
              className="text-lg uppercase"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-green-600 text-white hover:bg-green-700 text-lg uppercase"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl uppercase">Edit Defect Record</DialogTitle>
            <DialogDescription className="sr-only">
              Edit defect details below
            </DialogDescription>
          </DialogHeader>
          {editingRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-lg font-medium mb-1 block uppercase">Date</label>
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[160px] justify-start text-left font-normal",
                            !editingRecord.date && "text-muted-foreground"
                          )}
                        >
                          {editingRecord.date ? format(new Date(editingRecord.date), "dd/MM/yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editingRecord.date ? new Date(editingRecord.date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setEditingRecord({
                                ...editingRecord,
                                date: format(date, 'yyyy-MM-dd')
                              });
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div>
                  <label className="text-lg font-medium mb-1 block uppercase">Time</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={timeInput}
                      onChange={(e) => handleEditingTimeChange('time', e.target.value)}
                      placeholder="HH:MM"
                      className="text-lg uppercase w-[120px]"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="px-3"
                      onClick={() => {
                        const now = new Date();
                        const timeStr = format(now, 'HH:mm');
                        setTimeInput(timeStr);
                        setEditingRecord({...editingRecord, time: timeStr});
                      }}
                    >
                      <span className="sr-only">Set current time</span>
                      <Clock />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-lg font-medium mb-1 block uppercase">Registration</label>
                  <Input
                    value={editingRecord.registration}
                    onChange={(e) => setEditingRecord({
                      ...editingRecord, 
                      registration: e.target.value.toUpperCase().slice(0, 6)
                    })}
                    placeholder="REGISTRATION"
                    className="text-lg uppercase w-[120px]"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="text-lg font-medium mb-1 block uppercase">Station</label>
                  <Input
                    value={editingRecord.station}
                    onChange={(e) => setEditingRecord({
                      ...editingRecord, 
                      station: e.target.value.toUpperCase().slice(0, 6)
                    })}
                    placeholder="STATION"
                    className="text-lg uppercase w-[120px]"
                    maxLength={6}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-lg font-medium mb-1 block uppercase">ETA</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={etaTimeInput}
                      onChange={(e) => handleEditingTimeChange('eta', e.target.value)}
                      placeholder="HH:MM"
                      className="text-lg uppercase w-full"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="px-3"
                      onClick={() => {
                        const now = new Date();
                        const timeStr = format(now, 'HH:mm');
                        setEtaTimeInput(timeStr);
                        setEditingRecord({...editingRecord, eta: timeStr});
                      }}
                    >
                      <span className="sr-only">Set current time</span>
                      <Clock />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-lg font-medium mb-1 block uppercase">STD</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={stdTimeInput}
                      onChange={(e) => handleEditingTimeChange('std', e.target.value)}
                      placeholder="HH:MM"
                      className="text-lg uppercase w-full"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="px-3"
                      onClick={() => {
                        const now = new Date();
                        const timeStr = format(now, 'HH:mm');
                        setStdTimeInput(timeStr);
                        setEditingRecord({...editingRecord, std: timeStr});
                      }}
                    >
                      <span className="sr-only">Set current time</span>
                      <Clock />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-lg font-medium mb-1 block uppercase">UPD</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={updTimeInput}
                      onChange={(e) => handleEditingTimeChange('upd', e.target.value)}
                      placeholder="HH:MM"
                      className="text-lg uppercase w-full"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="px-3"
                      onClick={() => {
                        const now = new Date();
                        const timeStr = format(now, 'HH:mm');
                        setUpdTimeInput(timeStr);
                        setEditingRecord({...editingRecord, upd: timeStr});
                      }}
                    >
                      <span className="sr-only">Set current time</span>
                      <Clock />
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-lg font-medium mb-1 block uppercase">Defect Description</label>
                <Input
                  value={editingRecord.defect}
                  onChange={(e) => setEditingRecord({
                    ...editingRecord, 
                    defect: e.target.value.toUpperCase()
                  })}
                  placeholder="DESCRIPTION"
                  className="text-lg uppercase"
                />
              </div>
              <div>
                <label className="text-lg font-medium mb-1 block uppercase">Remarks</label>
                <Input
                  value={editingRecord.remarks}
                  onChange={(e) => setEditingRecord({
                    ...editingRecord, 
                    remarks: e.target.value.toUpperCase()
                  })}
                  placeholder="REMARKS"
                  className="text-lg uppercase"
                />
              </div>
              <div className="flex justify-center space-x-6 mt-2">
                <div className="flex flex-col items-center space-y-1">
                  <Checkbox
                    id="edit-sl"
                    checked={editingRecord.sl}
                    onCheckedChange={(checked) => 
                      setEditingRecord({
                        ...editingRecord, 
                        sl: checked as boolean
                      })
                    }
                    className="h-5 w-5"
                  />
                  <label htmlFor="edit-sl" className="text-lg font-medium uppercase">
                    SL
                  </label>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Checkbox
                    id="edit-rst"
                    checked={editingRecord.rst}
                    onCheckedChange={(checked) => 
                      setEditingRecord({
                        ...editingRecord, 
                        rst: checked as boolean
                      })
                    }
                    className="h-5 w-5"
                  />
                  <label htmlFor="edit-rst" className="text-lg font-medium uppercase">
                    RST
                  </label>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Checkbox
                    id="edit-ok"
                    checked={editingRecord.ok}
                    onCheckedChange={(checked) => 
                      setEditingRecord({
                        ...editingRecord, 
                        ok: checked as boolean
                      })
                    }
                    className="h-5 w-5"
                  />
                  <label htmlFor="edit-ok" className="text-lg font-medium uppercase">
                    OK
                  </label>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-4">
            <Button 
              variant="destructive" 
              onClick={() => setIsEditModalOpen(false)}
              className="text-lg uppercase"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              className="bg-green-600 text-white hover:bg-green-700 text-lg uppercase"
            >
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg shadow-sm border max-w-[1920px] mx-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer text-lg uppercase" onClick={handleSort}>
                Date/Time
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
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-lg text-gray-500">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow 
                  key={record.id} 
                  className="table-animation"
                  style={{
                    backgroundColor: record.ok ? "#F2FCE2" : record.sl ? "#FEF7CD" : "transparent"
                  }}
                >
                  <TableCell className="text-lg uppercase">
                    {format(new Date(record.date), 'dd/MM/yyyy')} {record.time}
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
      </div>
    </div>
  );
};

// Define a Clock component
const Clock = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default Index;
