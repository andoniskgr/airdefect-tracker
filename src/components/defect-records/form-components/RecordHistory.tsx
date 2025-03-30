
import React from 'react';
import { format, parseISO } from 'date-fns';

interface RecordHistoryProps {
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export const RecordHistory = ({
  createdBy,
  createdAt,
  updatedBy,
  updatedAt
}: RecordHistoryProps) => {
  // Format audit timestamps if they exist
  const createdAtFormatted = createdAt ? 
    format(parseISO(createdAt), 'dd/MM/yyyy HH:mm:ss') : 'N/A';
    
  const updatedAtFormatted = updatedAt ? 
    format(parseISO(updatedAt), 'dd/MM/yyyy HH:mm:ss') : 'N/A';

  return (
    <div className="border-t pt-4 mt-2">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Record History</h3>
      {createdBy && (
        <p className="text-xs text-gray-500">
          Created by: {createdBy} at {createdAtFormatted}
        </p>
      )}
      {updatedBy && updatedAt !== createdAt && (
        <p className="text-xs text-gray-500">
          Last updated by: {updatedBy} at {updatedAtFormatted}
        </p>
      )}
    </div>
  );
};
