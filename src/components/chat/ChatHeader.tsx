import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShipWheel, LogOut, ArrowLeft, Filter, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAdvancedSearch, SearchResult } from "@/hooks/useAdvancedSearch";
import SearchModeSelector from "./SearchModeSelector";
import SearchResults from "./SearchResults";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

interface ChatHeaderProps {
  signOut: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
  hasActiveFilters: boolean;
  onSearchResultClick?: (result: SearchResult) => void;
}

const ChatHeader = ({ 
  signOut, 
  searchTerm, 
  onSearchChange, 
  onOpenFilters, 
  hasActiveFilters,
  onSearchResultClick
}: ChatHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useThemeSettings();
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const advancedSearch = useAdvancedSearch();

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  // Sincronizar com o search term do header
  useEffect(() => {
    advancedSearch.setSearchTerm(searchTerm);
  }, [, advancedSearch]);

  // Realizar busca com debounce
  const debouncedSearch = useDebouncedCallback(() => {
    if (searchTerm.trim()) {
      advancedSearch.performSearch();
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, advancedSearch.searchMode, debouncedSearch]);

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    if (!value.trim()) {
      setShowSearchResults(false);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setShowSearchResults(false);
    if (onSearchResultClick) {
      onSearchResultClick(result);
    }
  };

  return (
    <header
      className="text-white shadow-md transition-colors duration-300 rounded-b-xl"
      style={{ backgroundColor: settings.primaryColor }}
    >
      <div className="flex flex-row items-center justify-between min-h-[64px] w-full px-6 py-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToDashboard}
            className="text-white hover:bg-white/20 focus-visible:ring-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {settings.logo ? (
            <img
              src={settings.logo}
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <ShipWheel
              className="h-8 w-8"
              style={{ color: settings.secondaryColor }}
            />
          )}
          <h1 className="text-2xl font-bold">{settings.brandName}</h1>
          <span className="text-lg ml-2">Conversas</span>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex items-center gap-3 flex-1 max-w-md mx-6">
          <SearchModeSelector 
            searchMode={advancedSearch.searchMode}
            onSearchModeChange={advancedSearch.setSearchMode}
          />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              placeholder={`Buscar ${
                advancedSearch.searchMode === "conversations" ? "conversas" :
                advancedSearch.searchMode === "notes" ? "anotações" : "conversas e anotações"
              }...`}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
            />
            {showSearchResults && (
              <SearchResults
                results={advancedSearch.searchResults}
                isSearching={advancedSearch.isSearching}
                onResultClick={handleSearchResultClick}
              />
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenFilters}
            className={`border-white/20 text-white bg-transparent hover:bg-white/20 ${
              hasActiveFilters ? 'bg-white/20 border-white' : ''
            }`}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-white/10 text-white border-0 px-3 py-1"
          >
            {user?.user_metadata?.name || user?.email}
          </Badge>
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={signOut}
            className="border-white text-white bg-transparent hover:bg-white/20"
            style={{ height: 40, borderRadius: 8, borderWidth: 1.4 }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
