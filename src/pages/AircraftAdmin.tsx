
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileSpreadsheet, Plus, Upload, Pencil } from "lucide-react";
import * as XLSX from 'xlsx';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAircraftId, setEditAircraftId] = useState<string | null>(null);
  
  // State for the aircraft form (used for both add and edit)
  const [aircraftForm, setAircraftForm] = useState<Omit<Aircraft, 'id'>>({
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
    setAircraftForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setAircraftForm(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Open add modal with empty form
  const openAddModal = () => {
    setAircraftForm({
      registration: "",
      type: "",
      engine: "",
      msn: "",
      cls: false,
      wifi: false,
    });
    setIsAddModalOpen(true);
  };

  // Open edit modal with aircraft data
  const openEditModal = (aircraft: Aircraft) => {
    setAircraftForm({
      registration: aircraft.registration,
      type: aircraft.type,
      engine: aircraft.engine,
      msn: aircraft.msn,
      cls: aircraft.cls,
      wifi: aircraft.wifi,
    });
    setEditAircraftId(aircraft.id);
    setIsEditModalOpen(true);
  };

  // Handle add form submission
  const handleAddSubmit = () => {
    // Validate form data
    if (!aircraftForm.registration || !aircraftForm.type || !aircraftForm.engine || !aircraftForm.msn) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create new aircraft with a unique ID
    const newAircraftWithId: Aircraft = {
      ...aircraftForm,
      id: crypto.randomUUID(),
    };

    // Add to the list
    setAircraftData(prev => [...prev, newAircraftWithId]);
    
    // Reset form and close modal
    setAircraftForm({
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

  // Handle edit form submission
  const handleEditSubmit = () => {
    // Validate form data
    if (!aircraftForm.registration || !aircraftForm.type || !aircraftForm.engine || !aircraftForm.msn) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!editAircraftId) {
      toast.error("No aircraft selected for editing");
      return;
    }

    // Update the existing aircraft
    setAircraftData(prev => 
      prev.map(aircraft => 
        aircraft.id === editAircraftId 
          ? { ...aircraftForm, id: editAircraftId } 
          : aircraft
      )
    );
    
    // Reset form and close modal
    setAircraftForm({
      registration: "",
      type: "",
      engine: "",
      msn: "",
      cls: false,
      wifi: false,
    });
    setEditAircraftId(null);
    setIsEditModalOpen(false);
    
    toast.success("Aircraft updated successfully");
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

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        
        // Assume the first sheet contains our data
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map JSON data to our Aircraft type
        const importedData: Aircraft[] = jsonData.map((row: any) => ({
          id: crypto.randomUUID(),
          registration: row['A/C'] || row['Registration'] || row['registration'] || '',
          type: row['Type'] || row['type'] || row['TYPE'] || '',
          engine: row['Engine'] || row['engine'] || row['ENGINE'] || '',
          msn: row['MSN'] || row['msn'] || '',
          cls: Boolean(row['CLS'] || row['cls'] || false),
          wifi: Boolean(row['WIFI'] || row['wifi'] || false),
        }));
        
        if (importedData.length === 0) {
          toast.error("No valid data found in the file");
          return;
        }
        
        setAircraftData(importedData);
        toast.success(`Successfully imported ${importedData.length} aircraft records`);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast.error("Failed to parse the Excel file. Please check the format.");
      }
    };
    
    reader.onerror = () => {
      toast.error("Error reading the file");
    };
    
    reader.readAsBinaryString(file);
    
    // Reset the file input
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Aircraft Administration</h1>
        
        <div className="mb-6 flex justify-between items-center">
          <Button 
            onClick={openAddModal}
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
                <TableHead className="text-lg uppercase px-4 py-3 text-white font-bold">Action</TableHead>
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
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditModal(aircraft)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-slate-800">
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
                value={aircraftForm.registration}
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
                value={aircraftForm.type}
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
                value={aircraftForm.engine}
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
                value={aircraftForm.msn}
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
                  checked={aircraftForm.cls}
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
                  checked={aircraftForm.wifi}
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
            <Button onClick={handleAddSubmit}>Add Aircraft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Aircraft Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Aircraft</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-registration" className="text-right">
                A/C
              </Label>
              <Input
                id="edit-registration"
                name="registration"
                value={aircraftForm.registration}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g. SX-DGT"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type
              </Label>
              <Input
                id="edit-type"
                name="type"
                value={aircraftForm.type}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g. A320-232"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-engine" className="text-right">
                Engine
              </Label>
              <Input
                id="edit-engine"
                name="engine"
                value={aircraftForm.engine}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g. IAE V2527-A5"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-msn" className="text-right">
                MSN
              </Label>
              <Input
                id="edit-msn"
                name="msn"
                value={aircraftForm.msn}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g. 3162"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-cls" className="text-right">
                CLS
              </Label>
              <div className="col-span-3">
                <Checkbox
                  id="edit-cls"
                  checked={aircraftForm.cls}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("cls", checked === true)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-wifi" className="text-right">
                WIFI
              </Label>
              <div className="col-span-3">
                <Checkbox
                  id="edit-wifi"
                  checked={aircraftForm.wifi}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("wifi", checked === true)
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AircraftAdmin;
