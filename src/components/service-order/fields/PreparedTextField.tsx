
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface PreparedTextFieldProps {
  preparedText: string;
}

const PreparedTextField: React.FC<PreparedTextFieldProps> = ({
  preparedText
}) => {
  const handleCopy = async () => {
    if (!preparedText) {
      toast.error("No text to copy");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(preparedText.trim());
      toast.success("Text copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error("Failed to copy to clipboard. Please copy manually.");
    }
  };
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block">Prepared text</label>
        {preparedText && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Text
          </Button>
        )}
      </div>
      <Textarea 
        name="preparedText"
        value={preparedText}
        className="w-full h-96 p-2 bg-white text-black rounded-md font-mono text-sm"
        placeholder="Enter prepared text here..."
        readOnly
      />
    </div>
  );
};

export default PreparedTextField;
