
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil } from "lucide-react";
import { Aircraft } from "@/types/aircraft";

interface AircraftTableProps {
  aircraftData: Aircraft[];
  onEditAircraft: (aircraft: Aircraft) => void;
}

export const AircraftTable = ({ aircraftData, onEditAircraft }: AircraftTableProps) => {
  return (
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
                    onClick={() => onEditAircraft(aircraft)}
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
  );
};
