
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
  sl: boolean;
  ok: boolean;
}

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState<DefectRecord[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    registration: '',
    station: '',
    defect: '',
    sl: false,
    ok: false,
  });

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
        title: "Validation Error",
        description: "Please fill in all required fields",
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
      title: "Success",
      description: "Defect record has been saved",
    });

    handleClear();
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      registration: '',
      station: '',
      defect: '',
      sl: false,
      ok: false,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Aircraft Defect Records</h1>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          Record Defect
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Aircraft Defect</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Time</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Aircraft Registration</label>
              <Input
                value={formData.registration}
                onChange={(e) => setFormData(prev => ({ ...prev, registration: e.target.value }))}
                placeholder="Enter aircraft registration"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Station</label>
              <Input
                value={formData.station}
                onChange={(e) => setFormData(prev => ({ ...prev, station: e.target.value }))}
                placeholder="Enter station"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Defect Description</label>
              <Input
                value={formData.defect}
                onChange={(e) => setFormData(prev => ({ ...prev, defect: e.target.value }))}
                placeholder="Enter defect description"
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
                <label htmlFor="sl" className="text-sm font-medium">
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
                <label htmlFor="ok" className="text-sm font-medium">
                  OK
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-gray-900 text-white hover:bg-gray-800">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={handleSort}>
                Date/Time
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Defect</TableHead>
              <TableHead>SL</TableHead>
              <TableHead>OK</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="table-animation">
                <TableCell>{record.date} {record.time}</TableCell>
                <TableCell>{record.registration}</TableCell>
                <TableCell>{record.station}</TableCell>
                <TableCell>{record.defect}</TableCell>
                <TableCell>{record.sl ? "Yes" : "No"}</TableCell>
                <TableCell>{record.ok ? "Yes" : "No"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Index;
