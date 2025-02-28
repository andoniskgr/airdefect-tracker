
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { format, parse } from 'date-fns';
import { ArrowUpDown } from "lucide-react";

interface DefectRecord {
  id: string;
  date: string;
  time: string;
  registration: string;
  station: string;
  defect: string;
  remarks: string;
  sl: boolean;
  ok: boolean;
}

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState<DefectRecord[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  const initialFormState = {
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    registration: '',
    station: '',
    defect: '',
    remarks: '',
    sl: false,
    ok: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [dateInput, setDateInput] = useState(format(new Date(), 'dd/MM/yyyy'));
  const [timeInput, setTimeInput] = useState(format(new Date(), 'HH:mm'));

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
    setDateInput(format(new Date(), 'dd/MM/yyyy'));
    setTimeInput(format(new Date(), 'HH:mm'));
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setDateInput(format(new Date(), 'dd/MM/yyyy'));
    setTimeInput(format(new Date(), 'HH:mm'));
  };

  const handleTimeInput = (value: string) => {
    setTimeInput(value);
    
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
      
      if (formattedTime.includes(':')) {
        setFormData(prev => ({ ...prev, time: formattedTime }));
        setTimeInput(formattedTime);
      }
    }
  };

  const handleDateInput = (value: string) => {
    setDateInput(value);
    
    // Only allow numbers and format them
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 8) {
      const day = numbers.slice(0, 2);
      const month = numbers.slice(2, 4);
      const year = numbers.slice(4, 8);
      
      let formattedDate = '';
      if (day) {
        const dayNum = parseInt(day);
        if (dayNum > 31) {
          formattedDate = '31/';
        } else if (dayNum < 1) {
          formattedDate = '01/';
        } else {
          formattedDate = day.padStart(2, '0') + '/';
        }
        
        if (month) {
          const monthNum = parseInt(month);
          if (monthNum > 12) {
            formattedDate += '12/';
          } else if (monthNum < 1) {
            formattedDate += '01/';
          } else {
            formattedDate += month.padStart(2, '0') + '/';
          }
          
          if (year) {
            formattedDate += year.padStart(4, '2');
          }
        }
      }

      if (formattedDate && formattedDate.split('/').length > 2) {
        try {
          const [d, m, y] = formattedDate.split('/');
          const isoDate = `${y || '2024'}-${m || '01'}-${d || '01'}`;
          setFormData(prev => ({ ...prev, date: isoDate }));
          setDateInput(formattedDate);
        } catch (e) {
          console.error('Error parsing date:', e);
        }
      }
    }
  };

  return (
    <div className="w-full px-4 py-8 fade-in">
      <div className="flex justify-between items-center mb-8 max-w-[1920px] mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 uppercase">Aircraft Defect Records</h1>
        <Button 
          onClick={() => {
            setFormData(initialFormState);
            setDateInput(format(new Date(), 'dd/MM/yyyy'));
            setTimeInput(format(new Date(), 'HH:mm'));
            setIsModalOpen(true);
          }}
          className="bg-gray-900 text-white hover:bg-gray-800 transition-colors text-lg uppercase"
        >
          Record Defect
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl uppercase">Record Aircraft Defect</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-lg font-medium mb-1 block uppercase">Date</label>
                <Input
                  type="text"
                  value={dateInput}
                  onChange={(e) => handleDateInput(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="text-lg uppercase w-[160px]"
                />
              </div>
              <div>
                <label className="text-lg font-medium mb-1 block uppercase">Time</label>
                <Input
                  type="text"
                  value={timeInput}
                  onChange={(e) => handleTimeInput(e.target.value)}
                  placeholder="HH:MM"
                  className="text-lg uppercase w-[120px]"
                />
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
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sl"
                  checked={formData.sl}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, sl: checked as boolean }))
                  }
                />
                <label htmlFor="sl" className="text-lg font-medium uppercase">
                  SL
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ok"
                  checked={formData.ok}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, ok: checked as boolean }))
                  }
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
              <TableHead className="text-lg uppercase">SL</TableHead>
              <TableHead className="text-lg uppercase">OK</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="table-animation">
                <TableCell className="text-lg uppercase">
                  {format(new Date(record.date), 'dd/MM/yyyy')} {record.time}
                </TableCell>
                <TableCell className="text-lg uppercase">{record.registration}</TableCell>
                <TableCell className="text-lg uppercase">{record.station}</TableCell>
                <TableCell className="text-lg uppercase">{record.defect}</TableCell>
                <TableCell className="text-lg uppercase">{record.remarks}</TableCell>
                <TableCell className="text-lg uppercase">{record.sl ? "YES" : "NO"}</TableCell>
                <TableCell className="text-lg uppercase">{record.ok ? "YES" : "NO"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Index;
