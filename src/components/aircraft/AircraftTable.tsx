
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ArrowUpDown } from "lucide-react";
import { Pencil, Trash2, FileText } from "lucide-react";
import { Aircraft } from "@/types/aircraft";
import { useState, useEffect } from "react";

interface AircraftTableProps {
  aircraftData: Aircraft[];
  onEditAircraft: (aircraft: Aircraft) => void;
  onDeleteAircraft: (id: string) => void;
  isAdmin?: boolean;
}

export const AircraftTable = ({ aircraftData, onEditAircraft, onDeleteAircraft, isAdmin = false }: AircraftTableProps) => {
  const [sortedData, setSortedData] = useState<Aircraft[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Aircraft, direction: 'asc' | 'desc' }>({
    key: 'registration',
    direction: 'asc'
  });
  

  useEffect(() => {
    // First remove duplicates based on registration
    const uniqueAircraft = aircraftData.reduce((acc: Aircraft[], current) => {
      const isDuplicate = acc.find((item) => item.registration === current.registration);
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Then sort the unique data
    const sortableData = [...uniqueAircraft];
    sortableData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setSortedData(sortableData);
  }, [aircraftData, sortConfig]);

  const handleSort = (key: keyof Aircraft) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortIndicator = (columnName: keyof Aircraft) => {
    if (sortConfig.key === columnName) {
      return (
        <span className="ml-1 text-white">
          {sortConfig.direction === 'asc' ? '↑' : '↓'}
        </span>
      );
    }
    return null;
  };

  const handleServiceOrder = (registration: string) => {
    // Open service order page in a new window with pre-filled aircraft registration
    const serviceOrderUrl = `/service-order?aircraft=${encodeURIComponent(registration)}`;
    window.open(serviceOrderUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  return (
    <div className="bg-white rounded-md shadow-md overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-800">
          <TableRow>
            <TableHead 
              className="text-lg uppercase px-4 py-3 text-white font-bold cursor-pointer"
              onClick={() => handleSort('registration')}
            >
              <div className="flex items-center">
                A/C
                <ArrowUpDown className="h-4 w-4 ml-2" />
                {getSortIndicator('registration')}
              </div>
            </TableHead>
            <TableHead 
              className="text-lg uppercase px-4 py-3 text-white font-bold cursor-pointer"
              onClick={() => handleSort('type')}
            >
              <div className="flex items-center">
                Type
                <ArrowUpDown className="h-4 w-4 ml-2" />
                {getSortIndicator('type')}
              </div>
            </TableHead>
            <TableHead 
              className="text-lg uppercase px-4 py-3 text-white font-bold cursor-pointer"
              onClick={() => handleSort('engine')}
            >
              <div className="flex items-center">
                Engine
                <ArrowUpDown className="h-4 w-4 ml-2" />
                {getSortIndicator('engine')}
              </div>
            </TableHead>
            <TableHead 
              className="text-lg uppercase px-4 py-3 text-white font-bold cursor-pointer"
              onClick={() => handleSort('msn')}
            >
              <div className="flex items-center">
                MSN
                <ArrowUpDown className="h-4 w-4 ml-2" />
                {getSortIndicator('msn')}
              </div>
            </TableHead>
            <TableHead className="text-lg uppercase px-4 py-3 text-white font-bold">CLS</TableHead>
            <TableHead className="text-lg uppercase px-4 py-3 text-white font-bold">WIFI</TableHead>
            {isAdmin && <TableHead className="text-lg uppercase px-4 py-3 text-white font-bold">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((aircraft) => (
              <TableRow key={aircraft.id} className="table-animation hover:bg-gray-100">
                <TableCell className="text-slate-800 font-medium">
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <span className="cursor-pointer hover:text-blue-600">{aircraft.registration}</span>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handleServiceOrder(aircraft.registration)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Service Order
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </TableCell>
                <TableCell className="text-slate-800">{aircraft.type}</TableCell>
                <TableCell className="text-slate-800">{aircraft.engine}</TableCell>
                <TableCell className="text-slate-800">{aircraft.msn}</TableCell>
                <TableCell>
                  <Checkbox checked={aircraft.cls} disabled />
                </TableCell>
                <TableCell>
                  <Checkbox checked={aircraft.wifi} disabled />
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEditAircraft(aircraft)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onDeleteAircraft(aircraft.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-4 text-slate-800">
                No aircraft data available. {isAdmin ? 'Import from Excel or add manually.' : 'Contact an administrator to add aircraft data.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
