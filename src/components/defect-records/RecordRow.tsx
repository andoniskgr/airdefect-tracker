import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MessageSquare,
  Trash,
  FileText,
  Settings,
  History,
  Globe,
  Lock,
} from "lucide-react";
import { DefectRecord } from "./DefectRecord.types";
import { HistoryModal } from "./HistoryModal";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { getUserByEmail } from "@/utils/firebaseDB";

interface RecordRowProps {
  record: DefectRecord;
  handleEditRecord: (record: DefectRecord) => void;
  handleDeleteRecord: (id: string) => void;
  handleUpdateRecord: (
    id: string,
    updates: Partial<DefectRecord>,
    oldRecord?: DefectRecord
  ) => void;
  handleToggleVisibility: (record: DefectRecord) => void;
  currentTime: Date;
  currentUserEmail?: string | null;
}

export const RecordRow = ({
  record,
  handleEditRecord,
  handleDeleteRecord,
  handleUpdateRecord,
  handleToggleVisibility,
  currentTime,
  currentUserEmail,
}: RecordRowProps) => {
  const [localData, setLocalData] = useState<DefectRecord>(record);
  const [isSaving, setIsSaving] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<string>("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const defectTextareaRef = useRef<HTMLTextAreaElement>(null);
  const remarksTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Cursor position tracking for input fields
  const registrationCursorPosition = useRef<number | null>(null);
  const stationCursorPosition = useRef<number | null>(null);
  const defectCursorPosition = useRef<number | null>(null);
  const remarksCursorPosition = useRef<number | null>(null);
  const etaCursorPosition = useRef<number | null>(null);
  const stdCursorPosition = useRef<number | null>(null);
  const updCursorPosition = useRef<number | null>(null);

  // Function to adjust textarea height
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = Math.max(textarea.scrollHeight, 32) + "px";
  };

  // Restore cursor position after re-renders
  useEffect(() => {
    if (registrationCursorPosition.current !== null) {
      const input = document.querySelector(
        `input[value="${localData.registration}"]`
      ) as HTMLInputElement;
      if (input && document.activeElement === input) {
        const pos = Math.min(
          registrationCursorPosition.current,
          localData.registration.length
        );
        input.setSelectionRange(pos, pos);
        registrationCursorPosition.current = null;
      }
    }
  });

  useEffect(() => {
    if (stationCursorPosition.current !== null) {
      const input = document.querySelector(
        `input[value="${localData.station}"]`
      ) as HTMLInputElement;
      if (input && document.activeElement === input) {
        const pos = Math.min(
          stationCursorPosition.current,
          localData.station.length
        );
        input.setSelectionRange(pos, pos);
        stationCursorPosition.current = null;
      }
    }
  });

  useEffect(() => {
    if (
      defectCursorPosition.current !== null &&
      defectTextareaRef.current &&
      document.activeElement === defectTextareaRef.current
    ) {
      const pos = Math.min(
        defectCursorPosition.current,
        localData.defect.length
      );
      defectTextareaRef.current.setSelectionRange(pos, pos);
      defectCursorPosition.current = null;
    }
  });

  useEffect(() => {
    if (
      remarksCursorPosition.current !== null &&
      remarksTextareaRef.current &&
      document.activeElement === remarksTextareaRef.current
    ) {
      const pos = Math.min(
        remarksCursorPosition.current,
        localData.remarks.length
      );
      remarksTextareaRef.current.setSelectionRange(pos, pos);
      remarksCursorPosition.current = null;
    }
  });

  useEffect(() => {
    if (etaCursorPosition.current !== null) {
      const input = document.querySelector(
        `input[value="${localData.eta}"]`
      ) as HTMLInputElement;
      if (input && document.activeElement === input) {
        const pos = Math.min(etaCursorPosition.current, localData.eta.length);
        input.setSelectionRange(pos, pos);
        etaCursorPosition.current = null;
      }
    }
  });

  useEffect(() => {
    if (stdCursorPosition.current !== null) {
      const input = document.querySelector(
        `input[value="${localData.std}"]`
      ) as HTMLInputElement;
      if (input && document.activeElement === input) {
        const pos = Math.min(stdCursorPosition.current, localData.std.length);
        input.setSelectionRange(pos, pos);
        stdCursorPosition.current = null;
      }
    }
  });

  useEffect(() => {
    if (updCursorPosition.current !== null) {
      const input = document.querySelector(
        `input[value="${localData.upd}"]`
      ) as HTMLInputElement;
      if (input && document.activeElement === input) {
        const pos = Math.min(updCursorPosition.current, localData.upd.length);
        input.setSelectionRange(pos, pos);
        updCursorPosition.current = null;
      }
    }
  });

  // Function to get creator information
  const getCreatorInfo = async (createdBy: string) => {
    try {
      const userData = await getUserByEmail(createdBy);
      if (userData && userData.userCode) {
        return userData.userCode;
      }
      return createdBy; // Fallback to email if no user code
    } catch (error) {
      return createdBy; // Fallback to email on error
    }
  };

  // Load creator information on mount
  useEffect(() => {
    if (record.createdBy) {
      getCreatorInfo(record.createdBy).then(setCreatorInfo);
    }
  }, [record.createdBy]);

  // Sync localData with record prop when record changes from external sources
  useEffect(() => {
    setLocalData(record);
  }, [record]);

  // Auto-adjust textarea heights on mount and when data changes
  useEffect(() => {
    if (defectTextareaRef.current) {
      adjustTextareaHeight(defectTextareaRef.current);
    }
    if (remarksTextareaRef.current) {
      adjustTextareaHeight(remarksTextareaRef.current);
    }
  }, [localData.defect, localData.remarks]);

  // Auto-save function with debouncing
  const autoSave = (updates: Partial<DefectRecord>) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await handleUpdateRecord(record.id, updates, record);
        // No toast for auto-save to avoid spam
      } catch (error) {
        toast.error("Failed to update record");
      } finally {
        setIsSaving(false);
      }
    }, 500); // 500ms debounce
  };

  const formatTimeInput = (input: string): string => {
    // Remove any non-digit characters
    const digitsOnly = input.replace(/[^\d]/g, "");

    // If we have 4 or more digits, format as HH:MM
    if (digitsOnly.length >= 4) {
      const hours = Math.min(parseInt(digitsOnly.substring(0, 2), 10), 23);
      const minutes = Math.min(parseInt(digitsOnly.substring(2, 4), 10), 59);
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    } else if (digitsOnly.length > 0) {
      // Handle partial input (less than 4 digits)
      if (digitsOnly.length <= 2) {
        // Just hours, pad with leading zero if needed
        const hours = Math.min(parseInt(digitsOnly, 10), 23);
        return `${hours.toString().padStart(2, "0")}:00`;
      } else {
        // Hours and partial minutes
        const hours = Math.min(parseInt(digitsOnly.substring(0, 2), 10), 23);
        const minutes = Math.min(parseInt(digitsOnly.substring(2), 10), 59);
        return `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
      }
    }

    // Return empty string if no valid input
    return "";
  };

  const handleTextChange = (
    field: keyof DefectRecord,
    value: string,
    event?: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Only update local state, don't auto-save on every keystroke
    // Convert to uppercase for remarks and defect fields
    const processedValue =
      field === "remarks" || field === "defect" ? value.toUpperCase() : value;

    // Store cursor position for specific fields
    if (event) {
      if (field === "registration") {
        registrationCursorPosition.current = event.target.selectionStart;
      } else if (field === "station") {
        stationCursorPosition.current = event.target.selectionStart;
      }
    }

    setLocalData((prev) => ({ ...prev, [field]: processedValue }));
  };

  // Handle textarea field changes
  const handleTextareaChange = (
    field: keyof DefectRecord,
    value: string,
    event?: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    // Only update local state, don't auto-save on every keystroke
    // Convert to uppercase for remarks and defect fields
    const processedValue =
      field === "remarks" || field === "defect" ? value.toUpperCase() : value;

    // Store cursor position for textarea fields
    if (event) {
      if (field === "defect") {
        defectCursorPosition.current = event.target.selectionStart;
      } else if (field === "remarks") {
        remarksCursorPosition.current = event.target.selectionStart;
      }
    }

    setLocalData((prev) => ({ ...prev, [field]: processedValue }));
  };

  const handleTextBlur = (field: keyof DefectRecord, value: string) => {
    // Only save if the value actually changed
    // Convert to uppercase for remarks and defect fields
    const processedValue =
      field === "remarks" || field === "defect" ? value.toUpperCase() : value;
    if (processedValue !== record[field]) {
      const updates = { [field]: processedValue };
      setLocalData((prev) => ({ ...prev, ...updates }));
      autoSave(updates);
    }
  };

  // Handle textarea field blur
  const handleTextareaBlur = (field: keyof DefectRecord, value: string) => {
    // Only save if the value actually changed
    // Convert to uppercase for remarks and defect fields
    const processedValue =
      field === "remarks" || field === "defect" ? value.toUpperCase() : value;
    if (processedValue !== record[field]) {
      const updates = { [field]: processedValue };
      setLocalData((prev) => ({ ...prev, ...updates }));
      autoSave(updates);
    }
  };

  const handleTimeChange = (value: string) => {
    // Only update local state, don't auto-save on every keystroke
    setLocalData((prev) => ({ ...prev, time: value }));
  };

  const handleTimeBlur = (value: string) => {
    if (value.trim()) {
      const formattedTime = formatTimeInput(value);
      // Only save if the value actually changed
      if (formattedTime !== record.time) {
        const updates = { time: formattedTime };
        setLocalData((prev) => ({ ...prev, ...updates }));
        autoSave(updates);
      }
    }
  };

  const handleTimeFieldChange = (
    field: "eta" | "std" | "upd",
    value: string,
    event?: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Only update local state, don't auto-save on every keystroke

    // Store cursor position for time fields
    if (event) {
      if (field === "eta") {
        etaCursorPosition.current = event.target.selectionStart;
      } else if (field === "std") {
        stdCursorPosition.current = event.target.selectionStart;
      } else if (field === "upd") {
        updCursorPosition.current = event.target.selectionStart;
      }
    }

    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTimeFieldBlur = (field: "eta" | "std" | "upd", value: string) => {
    if (value.trim()) {
      const formattedTime = formatTimeInput(value);
      // Only save if the value actually changed
      if (formattedTime !== record[field]) {
        const updates = { [field]: formattedTime };
        setLocalData((prev) => ({ ...prev, ...updates }));
        autoSave(updates);
      }
    } else {
      // Handle empty value - clear the field
      if (record[field] !== "") {
        const updates = { [field]: "" };
        setLocalData((prev) => ({ ...prev, ...updates }));
        autoSave(updates);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: keyof DefectRecord
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Trigger immediate save for the current field
      const currentValue = e.currentTarget.value;
      const updates = { [field]: currentValue };
      setLocalData((prev) => ({ ...prev, ...updates }));

      // Clear any pending auto-save and save immediately
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setIsSaving(true);
      try {
        handleUpdateRecord(record.id, updates, record);
        // No toast for auto-save to avoid spam
      } catch (error) {
        toast.error("Failed to update record");
      } finally {
        setIsSaving(false);
      }

      // Blur the field to remove focus
      e.currentTarget.blur();
    }
  };

  // Handle textarea keydown
  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    field: keyof DefectRecord
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Trigger immediate save for the current field
      const currentValue = e.currentTarget.value;
      const updates = { [field]: currentValue };
      setLocalData((prev) => ({ ...prev, ...updates }));

      // Clear any pending auto-save and save immediately
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setIsSaving(true);
      try {
        handleUpdateRecord(record.id, updates, record);
        // No toast for auto-save to avoid spam
      } catch (error) {
        toast.error("Failed to update record");
      } finally {
        setIsSaving(false);
      }

      // Blur the field to remove focus
      e.currentTarget.blur();
    }
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentValue = e.currentTarget.value;
      const formattedTime = currentValue.trim()
        ? formatTimeInput(currentValue)
        : "";
      const updates = { time: formattedTime };
      setLocalData((prev) => ({ ...prev, ...updates }));

      // Clear any pending auto-save and save immediately
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setIsSaving(true);
      try {
        handleUpdateRecord(record.id, updates, record);
        // No toast for auto-save to avoid spam
      } catch (error) {
        toast.error("Failed to update record");
      } finally {
        setIsSaving(false);
      }

      // Blur the field to remove focus
      e.currentTarget.blur();
    }
  };

  const handleTimeFieldKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "eta" | "std" | "upd"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentValue = e.currentTarget.value;
      const formattedTime = currentValue.trim()
        ? formatTimeInput(currentValue)
        : "";
      const updates = { [field]: formattedTime };
      setLocalData((prev) => ({ ...prev, ...updates }));

      // Clear any pending auto-save and save immediately
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setIsSaving(true);
      try {
        handleUpdateRecord(record.id, updates, record);
        // No toast for auto-save to avoid spam
      } catch (error) {
        toast.error("Failed to update record");
      } finally {
        setIsSaving(false);
      }

      // Blur the field to remove focus
      e.currentTarget.blur();
    }
  };

  const handleCheckboxChange = (
    field: "nxs" | "rst" | "dly" | "sl" | "pln" | "ok",
    checked: boolean
  ) => {
    const updates = { [field]: checked };
    setLocalData((prev) => ({ ...prev, ...updates }));
    autoSave(updates);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when focusing on input fields
    e.target.select();
  };

  // Function to select all text on focus for textarea
  const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Select all text when focusing on textarea fields
    e.target.select();
  };

  const handleServiceOrder = () => {
    // Open service order page in a new tab with pre-filled aircraft registration
    const serviceOrderUrl = `/service-order?aircraft=${encodeURIComponent(
      localData.registration
    )}`;
    window.open(serviceOrderUrl, "_blank");
  };

  const handleDefectServiceOrder = () => {
    // Open service order page with Defect type pre-selected
    const serviceOrderUrl = `/service-order?aircraft=${encodeURIComponent(
      localData.registration
    )}&type=defect`;
    window.open(serviceOrderUrl, "_blank");
  };

  const handleMELServiceOrder = () => {
    // Open service order page with MEL type pre-selected
    const serviceOrderUrl = `/service-order?aircraft=${encodeURIComponent(
      localData.registration
    )}&type=mel`;
    window.open(serviceOrderUrl, "_blank");
  };

  const handleManagerial = () => {
    // TODO: Implement managerial functionality
    toast.info("Managerial functionality coming soon!");
  };

  const handleHistory = () => {
    setIsHistoryModalOpen(true);
  };

  const shouldFlashUpd = (record: DefectRecord) => {
    // Check if UPD field is empty or record is marked as OK
    if (!record.upd || record.upd.trim() === "" || localData.ok) {
      return false;
    }

    const now = new Date();
    const recordDate = new Date(record.date);

    // If UPD time is after midnight (00:00), use the next day
    const updHour = parseInt(record.upd.split(":")[0], 10);
    const updDate =
      updHour < 6
        ? new Date(recordDate.getTime() + 24 * 60 * 60 * 1000) // Next day if before 6 AM
        : recordDate; // Same day if 6 AM or later

    const updTimeWithCorrectDate = new Date(
      `${updDate.toISOString().split("T")[0]}T${record.upd}:00`
    );

    const shouldFlash = now >= updTimeWithCorrectDate;

    return shouldFlash;
  };

  const getBgColor = () => {
    if (localData.ok) return "bg-green-200 text-slate-800";
    if (localData.sl) return "bg-yellow-200 text-slate-800";
    return "bg-white text-slate-800";
  };

  const copyToTeams = () => {
    try {
      let formattedText = `Time: ${record.time} // REG: ${record.registration} // STA: ${record.station} // DEFECT: ${record.defect}`;

      if (record.eta) {
        formattedText += ` // ETA: ${record.eta}`;
      }

      if (record.std) {
        formattedText += ` // STD: ${record.std}`;
      }

      // Handle environments where navigator.clipboard is not available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(formattedText)
          .then(() => {
            toast.success("Copied to clipboard for Teams");
          })
          .catch((err) => {
            toast.error("Failed to copy to clipboard");
          });
      } else {
        // Fallback for environments without clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = formattedText;
        textArea.style.position = "fixed"; // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand("copy");
          if (successful) {
            toast.success("Copied to clipboard for Teams");
          } else {
            toast.error("Failed to copy to clipboard");
          }
        } catch (err) {
          toast.error("Failed to copy to clipboard");
        }

        document.body.removeChild(textArea);
      }
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <>
      <TableRow
        key={record.id}
        className={`table-animation ${getBgColor()} hover:bg-slate-50 ${
          isSaving ? "opacity-75" : ""
        }`}
        style={{ height: "auto" }}
      >
        {/* Time - 6 characters */}
        <TableCell className="py-3" style={{ width: "1.5%" }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  value={localData.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  onBlur={(e) => handleTimeBlur(e.target.value)}
                  onKeyDown={handleTimeKeyDown}
                  onFocus={handleFocus}
                  placeholder="HH:MM"
                  maxLength={6}
                  className="text-sm uppercase font-medium h-8 border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 w-[80px]"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Created by: {creatorInfo || record.createdBy || "Unknown"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>

        {/* Registration - 6 characters */}
        <TableCell className="py-3" style={{ width: "1.5%" }}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <Input
                value={localData.registration}
                onChange={(e) =>
                  handleTextChange("registration", e.target.value, e)
                }
                onBlur={(e) => handleTextBlur("registration", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "registration")}
                onFocus={handleFocus}
                maxLength={6}
                className="text-sm uppercase font-medium h-8 border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 w-[60px]"
              />
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <FileText className="mr-2 h-4 w-4" />
                  Service Order
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem onClick={handleDefectServiceOrder}>
                    Defect
                  </ContextMenuItem>
                  <ContextMenuItem onClick={handleMELServiceOrder}>
                    MEL
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuItem onClick={handleManagerial}>
                <Settings className="mr-2 h-4 w-4" />
                Managerial
              </ContextMenuItem>
              <ContextMenuItem onClick={handleHistory}>
                <History className="mr-2 h-4 w-4" />
                History
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </TableCell>

        {/* Station - 6 characters */}
        <TableCell className="py-3" style={{ width: "1.5%" }}>
          <Input
            value={localData.station}
            onChange={(e) => handleTextChange("station", e.target.value, e)}
            onBlur={(e) => handleTextBlur("station", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "station")}
            onFocus={handleFocus}
            maxLength={6}
            className="text-sm uppercase font-medium h-8 border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 w-[60px]"
          />
        </TableCell>

        {/* Defect - 50 characters */}
        <TableCell
          className="px-0 py-3 align-top"
          style={{ verticalAlign: "top", height: "auto", width: "20%" }}
        >
          <Textarea
            ref={defectTextareaRef}
            value={localData.defect}
            onChange={(e) => handleTextareaChange("defect", e.target.value, e)}
            onBlur={(e) => handleTextareaBlur("defect", e.target.value)}
            onKeyDown={(e) => handleTextareaKeyDown(e, "defect")}
            onFocus={handleTextareaFocus}
            maxLength={50}
            className="text-sm uppercase font-medium min-h-[32px] border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 w-full resize-none overflow-hidden leading-tight"
            rows={1}
            style={{ height: "auto", minHeight: "32px" }}
            onInput={(e) => {
              adjustTextareaHeight(e.target as HTMLTextAreaElement);
            }}
          />
        </TableCell>

        {/* Remarks - 40 characters */}
        <TableCell
          className="px-0 py-3 align-top"
          style={{ verticalAlign: "top", height: "auto", width: "20%" }}
        >
          <Textarea
            ref={remarksTextareaRef}
            value={localData.remarks}
            onChange={(e) => handleTextareaChange("remarks", e.target.value, e)}
            onBlur={(e) => handleTextareaBlur("remarks", e.target.value)}
            onKeyDown={(e) => handleTextareaKeyDown(e, "remarks")}
            onFocus={handleTextareaFocus}
            maxLength={40}
            className="text-sm uppercase font-medium min-h-[32px] border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 w-full resize-none overflow-hidden leading-tight"
            rows={1}
            style={{ height: "auto", minHeight: "32px" }}
            onInput={(e) => {
              adjustTextareaHeight(e.target as HTMLTextAreaElement);
            }}
          />
        </TableCell>

        {/* ETA - 6 characters */}
        <TableCell className="px-0 py-3" style={{ width: "1.5%" }}>
          <Input
            value={localData.eta}
            onChange={(e) => handleTimeFieldChange("eta", e.target.value, e)}
            onBlur={(e) => handleTimeFieldBlur("eta", e.target.value)}
            onKeyDown={(e) => handleTimeFieldKeyDown(e, "eta")}
            onFocus={handleFocus}
            placeholder="HH:MM"
            maxLength={6}
            className="text-sm uppercase font-medium h-8 border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 w-[80px]"
          />
        </TableCell>

        {/* STD - 6 characters */}
        <TableCell className="px-0 py-3" style={{ width: "1.5%" }}>
          <Input
            value={localData.std}
            onChange={(e) => handleTimeFieldChange("std", e.target.value, e)}
            onBlur={(e) => handleTimeFieldBlur("std", e.target.value)}
            onKeyDown={(e) => handleTimeFieldKeyDown(e, "std")}
            onFocus={handleFocus}
            placeholder="HH:MM"
            maxLength={6}
            className="text-sm uppercase font-medium h-8 border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 w-[80px]"
          />
        </TableCell>

        {/* UPD - 6 characters */}
        <TableCell
          className={`px-0 py-3 ${shouldFlashUpd(record) ? "flash-upd" : ""}`}
          style={{ width: "1.5%" }}
        >
          <Input
            value={localData.upd}
            onChange={(e) => handleTimeFieldChange("upd", e.target.value, e)}
            onBlur={(e) => handleTimeFieldBlur("upd", e.target.value)}
            onKeyDown={(e) => handleTimeFieldKeyDown(e, "upd")}
            onFocus={handleFocus}
            placeholder="HH:MM"
            maxLength={6}
            className="text-sm uppercase font-medium h-8 border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 w-[80px]"
          />
        </TableCell>

        {/* NXS */}
        <TableCell className="checkbox-column">
          <div className="flex justify-center items-center w-full">
            <Checkbox
              checked={localData.nxs}
              onCheckedChange={(checked) =>
                handleCheckboxChange("nxs", checked as boolean)
              }
              className="h-6 w-6 bg-gray-200 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
        </TableCell>

        {/* RST */}
        <TableCell className="checkbox-column">
          <div className="flex justify-center items-center w-full">
            <Checkbox
              checked={localData.rst}
              onCheckedChange={(checked) =>
                handleCheckboxChange("rst", checked as boolean)
              }
              className="h-6 w-6 bg-gray-200 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
        </TableCell>

        {/* DLY */}
        <TableCell className="checkbox-column">
          <div className="flex justify-center items-center w-full">
            <Checkbox
              checked={localData.dly}
              onCheckedChange={(checked) =>
                handleCheckboxChange("dly", checked as boolean)
              }
              className="h-6 w-6 bg-gray-200 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
        </TableCell>

        {/* SL */}
        <TableCell className="checkbox-column">
          <div className="flex justify-center items-center w-full">
            <Checkbox
              checked={localData.sl}
              onCheckedChange={(checked) =>
                handleCheckboxChange("sl", checked as boolean)
              }
              className="h-6 w-6 bg-gray-200 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
        </TableCell>

        {/* PLN */}
        <TableCell className="checkbox-column">
          <div className="flex justify-center items-center w-full">
            <Checkbox
              checked={localData.pln}
              onCheckedChange={(checked) =>
                handleCheckboxChange("pln", checked as boolean)
              }
              className="h-6 w-6 bg-gray-200 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
        </TableCell>

        {/* OK */}
        <TableCell className="checkbox-column">
          <div className="flex justify-center items-center w-full">
            <Checkbox
              checked={localData.ok}
              onCheckedChange={(checked) =>
                handleCheckboxChange("ok", checked as boolean)
              }
              className="h-6 w-6 bg-gray-200 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell className="px-0 py-3" style={{ width: "3%" }}>
          <div className="flex space-x-1 items-center">
            {/* Public/Private indicator */}
            {record.createdBy === currentUserEmail ? (
              // Clickable for record creator
              <button
                onClick={() => handleToggleVisibility(record)}
                className="flex items-center hover:opacity-70 transition-opacity"
                title={
                  record.isPublic
                    ? "Click to make private - Currently visible to other users"
                    : "Click to make public - Currently only visible to you"
                }
              >
                {record.isPublic ? (
                  <Globe className="h-4 w-4 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
              </button>
            ) : (
              // Read-only for other users
              <div
                className="flex items-center"
                title={
                  record.isPublic
                    ? "Public record - Visible to all users"
                    : "Private record - Only visible to creator"
                }
              >
                {record.isPublic ? (
                  <Globe className="h-4 w-4 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
              </div>
            )}
            {/* Only show delete button for records created by current user */}
            {record.createdBy === currentUserEmail && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteRecord(record.id)}
                className="p-1 h-6 w-6"
              >
                <Trash className="h-3 w-3" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={copyToTeams}
              className="p-1 h-6 w-6 bg-blue-500 hover:bg-blue-600"
            >
              <MessageSquare className="h-3 w-3" />
              <span className="sr-only">Copy for Teams</span>
            </Button>
            {isSaving && (
              <div className="flex items-center text-xs text-gray-500">
                Saving...
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        record={record}
      />
    </>
  );
};
