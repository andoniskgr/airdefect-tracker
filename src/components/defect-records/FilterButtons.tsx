
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilterType, ExportType } from './DefectRecord.types';
import { Download, FileDown } from 'lucide-react';

interface FilterButtonsProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  handleExport: (type: ExportType) => void;
}

export const FilterButtons = ({ filter, setFilter, handleExport }: FilterButtonsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Button 
        onClick={() => setFilter('all')}
        variant={filter === 'all' ? 'default' : 'outline'}
        className="text-sm uppercase"
      >
        All
      </Button>
      <Button 
        onClick={() => {
          // Toggle between sl and sl-ok filters
          if (filter === 'sl') {
            setFilter('sl-ok');
          } else if (filter === 'sl-ok') {
            setFilter('ok');
          } else if (filter === 'ok') {
            setFilter('sl-ok');
          } else {
            setFilter('sl');
          }
        }}
        variant={filter === 'sl' ? 'default' : 'outline'}
        className={`text-sm uppercase ${filter === 'sl-ok' ? 'bg-yellow-100 text-yellow-900 border-yellow-300' : ''}`}
      >
        SL Only
      </Button>
      <Button 
        onClick={() => {
          // Toggle between ok and sl-ok filters
          if (filter === 'ok') {
            setFilter('sl-ok');
          } else if (filter === 'sl-ok') {
            setFilter('sl');
          } else if (filter === 'sl') {
            setFilter('sl-ok');
          } else {
            setFilter('ok');
          }
        }}
        variant={filter === 'ok' ? 'default' : 'outline'}
        className={`text-sm uppercase ${filter === 'sl-ok' ? 'bg-green-100 text-green-900 border-green-300' : ''}`}
      >
        OK Only
      </Button>
      <div className="flex-grow" />
      <Button 
        onClick={() => handleExport('pdf')}
        variant="outline"
        className="text-sm ml-auto"
      >
        <FileDown className="h-4 w-4 mr-2" />
        PDF
      </Button>
      <Button 
        onClick={() => handleExport('excel')}
        variant="outline"
        className="text-sm"
      >
        <Download className="h-4 w-4 mr-2" />
        Excel
      </Button>
    </div>
  );
};
