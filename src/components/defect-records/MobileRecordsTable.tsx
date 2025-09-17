import React, { useState } from "react";
import { DefectRecord } from "./DefectRecord.types";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { MobileEditDefectModal } from "./MobileEditDefectModal";

interface MobileRecordsTableProps {
  records: DefectRecord[];
  handleEditRecord: (record: DefectRecord) => void;
  handleDeleteRecord: (id: string) => void;
  handleUpdateRecord: (id: string, updates: Partial<DefectRecord>) => void;
  handleToggleVisibility: (record: DefectRecord) => void;
  currentUserEmail?: string | null;
  isArchiveView?: boolean;
}

export const MobileRecordsTable = ({
  records,
  handleEditRecord,
  handleDeleteRecord,
  handleUpdateRecord,
  handleToggleVisibility,
  currentUserEmail,
  isArchiveView = false,
}: MobileRecordsTableProps) => {
  const [selectedRecord, setSelectedRecord] = useState<DefectRecord | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const groupRecordsByDate = () => {
    const groups: { [key: string]: DefectRecord[] } = {};

    records.forEach((record) => {
      const dateKey = format(new Date(record.date), "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(record);
    });

    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((dateKey) => ({
        date: dateKey,
        formattedDate: format(new Date(dateKey), "dd/MM/yyyy"),
        records: groups[dateKey].sort((a, b) => a.time.localeCompare(b.time)),
      }));
  };

  const groupedRecords = groupRecordsByDate();

  const handleRecordClick = (record: DefectRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (updatedRecord: DefectRecord) => {
    handleUpdateRecord(updatedRecord.id, updatedRecord);
    setIsEditModalOpen(false);
    setSelectedRecord(null);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setSelectedRecord(null);
  };

  const getRowColorClass = (record: DefectRecord) => {
    // Only show yellow for SL and green for OK, same logic as desktop
    if (record.ok) return "bg-green-200 text-slate-800";
    if (record.sl) return "bg-yellow-200 text-slate-800";
    return "bg-white text-slate-800";
  };

  if (!isMobile) {
    return null; // Only show on mobile
  }

  return (
    <div className="w-full">
      {records.length === 0 ? (
        <div className="text-center py-8 text-lg text-gray-500 bg-white rounded-lg">
          No records found
        </div>
      ) : (
        <div className="space-y-4">
          {groupedRecords.map((group) => (
            <div
              key={group.date}
              className="bg-white rounded-lg shadow-sm border"
            >
              {/* Date Header */}
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  {group.formattedDate}
                </h3>
                <p className="text-sm text-gray-600">
                  {group.records.length} record
                  {group.records.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Records List */}
              <div className="divide-y divide-gray-200">
                {group.records.map((record) => (
                  <div
                    key={record.id}
                    className={cn(
                      "p-4 cursor-pointer transition-colors mobile-record-card",
                      getRowColorClass(record),
                      "hover:opacity-80"
                    )}
                    onClick={() => handleRecordClick(record)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-900 bg-blue-100 px-2 py-1 rounded shadow-sm">
                            {record.time}
                          </span>
                          <span className="text-sm font-medium text-gray-900 bg-green-100 px-2 py-1 rounded shadow-sm">
                            {record.registration}
                          </span>
                          <span className="text-sm font-medium text-gray-900 bg-yellow-100 px-2 py-1 rounded shadow-sm">
                            {record.station}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {record.defect}
                        </p>
                        {record.remarks && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {record.remarks}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {/* Status indicators */}
                        <div className="flex space-x-1">
                          {record.nxs && (
                            <span className="text-xs bg-red-200 text-red-900 px-2 py-1 rounded shadow-sm font-medium">
                              NXS
                            </span>
                          )}
                          {record.rst && (
                            <span className="text-xs bg-orange-200 text-orange-900 px-2 py-1 rounded shadow-sm font-medium">
                              RST
                            </span>
                          )}
                          {record.dly && (
                            <span className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded shadow-sm font-medium">
                              DLY
                            </span>
                          )}
                          {record.pln && (
                            <span className="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded shadow-sm font-medium">
                              PLN
                            </span>
                          )}
                          {record.sl && (
                            <span className="text-xs bg-purple-200 text-purple-900 px-2 py-1 rounded shadow-sm font-medium">
                              SL
                            </span>
                          )}
                          {record.ok && (
                            <span className="text-xs bg-green-200 text-green-900 px-2 py-1 rounded shadow-sm font-medium">
                              OK
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {selectedRecord && (
        <MobileEditDefectModal
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          record={selectedRecord}
          onUpdate={handleEditSubmit}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  );
};
