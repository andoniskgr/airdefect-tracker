
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface PreparedTextFieldProps {
  preparedText: string;
}

const PreparedTextField: React.FC<PreparedTextFieldProps> = ({
  preparedText
}) => {
  return (
    <div className="mt-4">
      <label className="block mb-2">Prepared text</label>
      <Textarea 
        name="preparedText"
        value={preparedText}
        className="w-full h-96 p-2 bg-white text-black rounded-md font-mono text-sm"
        placeholder="Enter prepared text here..."
      />
    </div>
  );
};

export default PreparedTextField;
