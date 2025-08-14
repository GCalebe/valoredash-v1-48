// @ts-nocheck
import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Plus, X } from "lucide-react";

interface ContactHeaderProps {
  contact: {
    name: string;
    avatar?: string;
    status?: string;
    phone?: string;
    email?: string;
  };
  tags: string[];
  newTag: string;
  onNewTagChange: (v: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export const ContactHeader: React.FC<ContactHeaderProps> = ({
  contact,
  tags,
  newTag,
  onNewTagChange,
  onAddTag,
  onRemoveTag,
}) => {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar className="w-16 h-16">
            {contact.avatar ? (
              <AvatarImage src={contact.avatar} alt={contact.name} />
            ) : (
              <AvatarFallback className="text-lg">
                {contact.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            )}
          </Avatar>
          <div
            className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
              contact.status === "online"
                ? "bg-green-500"
                : contact.status === "away"
                ? "bg-yellow-500"
                : "bg-gray-400",
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-1">{contact.name}</h3>
          <p className="text-sm text-muted-foreground capitalize mb-2">{contact.status || "offline"}</p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">{contact.phone || "+1 (555) 123-4567"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">{contact.email || "@conversa_de_demonstração"}</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                  {tag}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => onRemoveTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-1">
              <Input
                placeholder="Nova tag..."
                value={newTag}
                onChange={(e) => onNewTagChange(e.target.value)}
                className="h-6 text-xs"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newTag.trim()) {
                    onAddTag();
                  }
                }}
              />
              <Button size="sm" variant="outline" className="h-6 px-2" onClick={onAddTag}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHeader;


