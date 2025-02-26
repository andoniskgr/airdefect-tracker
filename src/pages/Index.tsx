
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
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
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setFormData(initialFormState);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 uppercase">Aircraft Defect Records</h1>
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
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="text-lg uppercase"
                />
              </div>
              <div>
                <label className="text-lg font-medium mb-1 block uppercase">Time</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="text-lg uppercase"
                />
              </div>
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">Aircraft Registration</label>
              <Input
                value={formData.registration}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  registration: e.target.value.toUpperCase().slice(0, 6)
                }))}
                placeholder="ENTER REGISTRATION"
                className="text-lg uppercase"
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
                placeholder="ENTER STATION"
                className="text-lg uppercase"
                maxLength={6}
              />
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">Defect Description</label>
              <Input
                value={formData.defect}
                onChange={(e) => setFormData(prev => ({ ...prev, defect: e.target.value.toUpperCase() }))}
                placeholder="ENTER DEFECT DESCRIPTION"
                className="text-lg uppercase"
              />
            </div>
            <div>
              <label className="text-lg font-medium mb-1 block uppercase">Remarks</label>
              <Input
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value.toUpperCase() }))}
                placeholder="ENTER REMARKS"
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

      <div className="bg-white rounded-lg shadow-sm border">
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
