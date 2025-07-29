import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline: boolean;
  status?: "online" | "away" | "offline";
  phone?: string;
  email?: string;
  sessionId?: string;
}

interface ConversationListPanelProps {
  contacts: Contact[];
  selectedContactId?: string;
  onContactSelect: (contactId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  getStatusColor: (status?: string) => string;
  width: number;
}

export default function ConversationListPanel({
  contacts,
  selectedContactId,
  onContactSelect,
  searchQuery,
  onSearchChange,
  onFilterClick,
  activeTab,
  onTabChange,
  sortBy,
  onSortChange,
  getStatusColor,
  width
}: ConversationListPanelProps) {
  return (
    <div 
      className="border-r border-border bg-background flex flex-col min-w-0"
      style={{ width: `${width}px` }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
          <div className="text-sm text-muted-foreground">
            {contacts.length} conversas
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filters */}
        <div className="mt-3">
          <Button 
            variant="outline" 
            className="h-8 text-xs w-full"
            onClick={onFilterClick}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Tabs and Sort */}
      <div className="px-4 py-2 border-b border-border">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">Não lidas</TabsTrigger>
            <TabsTrigger value="online" className="text-xs">Online</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="mt-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="name">Nome A-Z</SelectItem>
              <SelectItem value="unread">Não lidas primeiro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onContactSelect(contact.id)}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-colors hover:bg-accent",
                selectedContactId === contact.id && "bg-accent"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background",
                    getStatusColor(contact.status)
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-foreground truncate">{contact.name}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{contact.timestamp}</span>
                      {contact.unreadCount && (
                        <Badge variant="default" className="ml-1 min-w-[20px] h-5 text-xs px-1.5">
                          {contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}