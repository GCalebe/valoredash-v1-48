// @ts-nocheck
import React, { useState } from "react";
import ContactHeader from "./contact-info/ContactHeader";
import ModernContactTabs from "./contact-info/ModernContactTabs";
// Removed old custom field imports - now handled in ModernContactTabs

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
  tags?: string[]; // Adicionar suporte a tags
}

// Removed EditingField interface - handled in ModernContactTabs

interface ContactInfoProps {
  contact: Contact;
  getStatusColor: (status?: string) => string;
  width: number;
  onTagsChange?: (tags: string[]) => void; // Callback para mudanças nas tags
}

export default function ContactInfo({ contact, getStatusColor, width, onTagsChange }: Readonly<ContactInfoProps>) {
  const [tags, setTags] = useState<string[]>(contact.tags || []);
  const [newTag, setNewTag] = useState("");

  // Sincronizar mudanças nas tags com o callback
  const updateTags = (newTags: string[]) => {
    setTags(newTags);
    onTagsChange?.(newTags);
  };

  return (
    <div className="bg-background flex flex-col h-full">
      {/* Contact Header */}
      <ContactHeader
        contact={{
          name: contact.name,
          avatar: contact.avatar,
          status: contact.status,
          phone: contact.phone,
          email: contact.email,
        }}
        tags={tags}
        newTag={newTag}
        onNewTagChange={setNewTag}
        onAddTag={() => {
          if (newTag.trim()) {
            updateTags([...tags, newTag.trim()]);
            setNewTag('');
          }
        }}
        onRemoveTag={(tag) => updateTags(tags.filter((t) => t !== tag))}
      />
      
      {/* Modern Contact Tabs */}
      <ModernContactTabs
        contactId={contact.id}
        contact={contact}
        onFieldUpdate={(field, value) => {
          // Update contact data - this could be expanded to call parent callbacks
          console.log(`Updating ${field}:`, value);
        }}
      />
    </div>
  );
}