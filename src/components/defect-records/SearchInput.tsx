import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({
  searchQuery,
  setSearchQuery,
  placeholder = "Search records...",
  className = "",
}: SearchInputProps) => {
  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 bg-white border-slate-300 text-slate-800 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
          >
            <X className="h-4 w-4 text-slate-500" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    </div>
  );
};
