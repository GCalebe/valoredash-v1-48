import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreHorizontal } from "lucide-react";
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

interface ConversationHeaderProps {
  contact: Contact;
  getStatusColor: (status?: string) => string;
}

export default function ConversationHeader({ contact, getStatusColor }: ConversationHeaderProps) {
  return (
    <div className="p-4 border-b border-border bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
              getStatusColor(contact.status)
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{contact.name}</h3>
            <p className="text-sm text-muted-foreground">
              {contact.isOnline ? 'Online' : `Visto por último ${contact.timestamp}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}