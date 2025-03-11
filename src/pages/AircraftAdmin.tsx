
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileSpreadsheet, Plus, Upload } from "lucide-react";

// Define the Aircraft type
interface Aircraft {
  id: string;
  registration: string; // A/C
  type: string;
  engine: string;
  msn: string;
  cls: boolean;
  wifi: boolean;
}

const AircraftAdmin = () => {
  // State for the aircraft data
  const [aircraftData, setAircraftData] = useState<Aircraft[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // State for the new aircraft form
  const [newAircraft, setNewAircraft] = useState<Omit<Aircraft, 'id'>>({
    registration: "",
    type: "",
    engine: "",
    msn: "",
    cls: false,
    wifi: false,
  });

  // Handle the form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAircraft(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setNewAircraft(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate form data
    if (!newAircraft.registration || !newAircraft.type || !newAircraft.engine || !newAircraft.msn) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create new aircraft with a unique ID
    const newAircraftWithId: Aircraft = {
      ...newAircraft,
      id: crypto.randomUUID(),
    };

    // Add to the list
    setAircraftData(prev => [...prev, newAircraftWithId]);
    
    // Reset form and close modal
    setNewAircraft({
      registration: "",
      type: "",
      engine: "",
      msn: "",
      cls: false,
      wifi: false,
    });
    setIsAddModalOpen(false);
    
    toast.success("Aircraft added successfully");
  };

  // Handle Excel import
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast.error("Please upload a valid Excel or CSV file");
      return;
    }

    // In a real app, you would use a library like xlsx to read the file
    // For now, we'll just show a success message
    toast.success(`File "${file.name}" received. In a real app, this would parse the Excel data.`);
    
    // Mock importing some data for demonstration
    const mockImportedData: Aircraft[] = [
      { id: "1", registration: "SX-DGT", type: "A320-232", engine: "IAE V2527-A5", msn: "3162", cls: true, wifi: false },
      { id: "2", registration: "SX-DNB", type: "A321-231", engine: "IAE V2533-A5", msn: "3274", cls: false, wifi: true },
      { id: "3", registration: "SX-DGY", type: "A320-232", engine: "IAE V2527-A5", msn: "3611", cls: true, wifi: true },
    ];
    
    setAircraftData(mockImportedData);
    
    // Reset the file input
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Aircraft Administration</h1>
        
        <div className="mb-6 flex justify-between items-center">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Aircraft
          </Button>
          
          <div className="relative">
            <Input
              type="file"
              id="excel-upload"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelImport}
            />
            <Label 
              htmlFor="excel-upload" 
              className="cursor-pointer inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Import from Excel
            </Label>
          </div>
        </div>
        
        <div className="bg-white rounded-md shadow-md overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-800">
              <TableRow>
                <TableHead className="text-lg uppercase px-4 py-3 text-white font-bold">A/C</TableHead>
                <TableHead className="text-lg uppercase px-4 py-3 text-white font-bold">Type</TableHead>
                <TableHead className="text-lg uppercase px-4 py-3 text-white font-bold">Engine</TableHead>
                <TableHead className="text-lg uppercase px-4 py-3 text-white font-bold">MSN</TableHead>
                <TableHead className="text-lg uppercase px-4 py-3 text-white font-bold">CLS</TableHead>
                <TableHead className="text-lg uppercase px-4 py-3 text-white font-bold">WIFI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aircraftData.length > 0 ? (
                aircraftData.map((aircraft) => (
                  <TableRow key={aircraft.id} className="table-animation hover:bg-gray-100">
                    <TableCell className="text-slate-800 font-medium">{aircraft.registration}</TableCell>
                    <TableCell className="text-slate-800">{aircraft.type}</TableCell>
                    <TableCell className="text-slate-800">{aircraft.engine}</TableCell>
                    <TableCell className="text-slate-800">{aircraft.msn}</TableCell>
                    <TableCell>
                      <Checkbox checked={aircraft.cls} disabled />
                    </TableCell>
                    <TableCell>
                      <Checkbox checked={aircraft.wifi} disabled />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-slate-800">
                    No aircraft data available. Import from Excel or add manually.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Aircraft Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Aircraft</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="registration" className="text-right">
                A/C
              </Label>
              <Input
                id="registration"
                name="registration"
                value={newAircraft.registration}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g. SX-DGT"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Input
                id="type"
                name="type"
                value={newAircraft.type}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g. A320-232"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="engine" className="text-right">
                Engine
              </Label>
              <Input
                id="engine"
                name="engine"
                value={newAircraft.engine}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g. IAE V2527-A5"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="msn" className="text-right">
                MSN
              </Label>
              <Input
                id="msn"
                name="msn"
                value={newAircraft.msn}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g. 3162"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cls" className="text-right">
                CLS
              </Label>
              <div className="col-span-3">
                <Checkbox
                  id="cls"
                  checked={newAircraft.cls}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("cls", checked === true)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="wifi" className="text-right">
                WIFI
              </Label>
              <div className="col-span-3">
                <Checkbox
                  id="wifi"
                  checked={newAircraft.wifi}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("wifi", checked === true)
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Aircraft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AircraftAdmin;
