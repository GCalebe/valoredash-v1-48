import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, FileText, MessageSquare, Clock } from "lucide-react";
import { SearchResult } from "@/hooks/useAdvancedSearch";

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  onResultClick: (result: SearchResult) => void;
}

const SearchResults = ({ results, isSearching, onResultClick }: SearchResultsProps) => {
  const getResultIcon = (type: string) => {
    switch (type) {
      case "conversation":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "note":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getResultTypeBadge = (type: string) => {
    switch (type) {
      case "conversation":
        return <Badge variant="secondary" className="text-xs">Conversa</Badge>;
      case "note":
        return <Badge variant="outline" className="text-xs">Anotação</Badge>;
      case "message":
        return <Badge variant="default" className="text-xs">Mensagem</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Resultado</Badge>;
    }
  };

  if (isSearching) {
    return (
      <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-lg">
      <CardContent className="p-0">
        <ScrollArea className="max-h-80">
          <div className="p-2">
            <div className="text-xs text-muted-foreground mb-2 px-2">
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </div>
            <div className="space-y-1">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => onResultClick(result)}
                  className="p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getResultIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {result.title}
                        </h4>
                        {getResultTypeBadge(result.type)}
                      </div>
                      <p 
                        className="text-sm text-muted-foreground line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: result.highlighted || result.content }}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {result.timestamp}
                        </span>
                        {result.conversationName && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {result.conversationName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SearchResults;