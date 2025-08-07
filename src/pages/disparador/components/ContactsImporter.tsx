// @ts-nocheck
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

interface Contact { number: string; name?: string }

interface ContactsImporterProps {
  contacts: Contact[];
  onProcessFile: (file: File) => void;
}

const ContactsImporter: React.FC<ContactsImporterProps> = ({ contacts, onProcessFile }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Contatos ({contacts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Importar Contatos</Label>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onProcessFile(file);
            }}
            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-muted-foreground mt-1">Formato: número,nome (um por linha)</p>
        </div>

        {contacts.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {contacts.slice(0, 10).map((contact, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{contact.number}</p>
                  {contact.name && <p className="text-xs text-muted-foreground">{contact.name}</p>}
                </div>
              </div>
            ))}
            {contacts.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">+{contacts.length - 10} contatos adicionais</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactsImporter;


