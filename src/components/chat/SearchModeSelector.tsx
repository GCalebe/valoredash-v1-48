import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, FileText, Search } from "lucide-react";
import { SearchMode } from "@/hooks/useAdvancedSearch";

interface SearchModeSelectorProps {
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
}

const SearchModeSelector = ({ searchMode, onSearchModeChange }: SearchModeSelectorProps) => {
  const getModeIcon = (mode: SearchMode) => {
    switch (mode) {
      case "conversations":
        return <MessageCircle className="h-4 w-4" />;
      case "notes":
        return <FileText className="h-4 w-4" />;
      case "both":
        return <Search className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getModeLabel = (mode: SearchMode) => {
    switch (mode) {
      case "conversations":
        return "Conversas";
      case "notes":
        return "Anotações";
      case "both":
        return "Ambos";
      default:
        return "Buscar";
    }
  };

  return (
    <Select value={searchMode} onValueChange={(value) => onSearchModeChange(value as SearchMode)}>
      <SelectTrigger className="w-auto bg-white/10 border-white/20 text-white hover:bg-white/20">
        <div className="flex items-center gap-2">
          {getModeIcon(searchMode)}
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="conversations">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversas
          </div>
        </SelectItem>
        <SelectItem value="notes">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Anotações
          </div>
        </SelectItem>
        <SelectItem value="both">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Ambos
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SearchModeSelector;