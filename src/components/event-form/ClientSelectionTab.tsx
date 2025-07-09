import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/client";

interface ClientSelectionTabProps {
  state: any;
  updateState: (updates: any) => void;
  filteredContacts: Contact[];
  onSelectClient: (contact: Contact) => void;
  onNewClient: () => void;
  onSaveNewClient: () => void;
  onNext: () => void;
}

export function ClientSelectionTab({
  state,
  updateState,
  filteredContacts,
  onSelectClient,
  onNewClient,
  onSaveNewClient,
  onNext,
}: ClientSelectionTabProps) {
  if (!state.isNewClient) {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="client-search">Buscar Cliente</Label>
          <Input
            id="client-search"
            placeholder="Digite nome, email ou telefone"
            value={state.searchTerm}
            onChange={(e) => updateState({ searchTerm: e.target.value })}
            className={state.errors.client ? "border-destructive" : ""}
          />
          {state.errors.client && (
            <p className="text-sm text-destructive">{state.errors.client}</p>
          )}
        </div>
        
        <div className="max-h-60 overflow-y-auto border rounded-md">
          {filteredContacts.length > 0 ? (
            <div className="divide-y">
              {filteredContacts.map((contact) => (
                <div 
                  key={contact.id}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => onSelectClient(contact)}
                >
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {contact.phone}
                    {contact.email && ` • ${contact.email}`}
                  </div>
                </div>
              ))}
            </div>
          ) : state.searchTerm ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Nenhum cliente encontrado
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Digite para buscar clientes
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <Button type="button" variant="outline" onClick={onNewClient}>
            + Novo Cliente
          </Button>
          
          <Button 
            type="button" 
            onClick={onNext}
            disabled={!state.selectedClient}
          >
            Próximo
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-client-name">Nome do Cliente *</Label>
          <Input
            id="new-client-name"
            value={state.newClientData.name}
            onChange={(e) => updateState({ 
              newClientData: { ...state.newClientData, name: e.target.value }
            })}
            className={state.errors.newClientName ? "border-destructive" : ""}
          />
          {state.errors.newClientName && (
            <p className="text-sm text-destructive">{state.errors.newClientName}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new-client-email">Email</Label>
          <Input
            id="new-client-email"
            type="email"
            value={state.newClientData.email}
            onChange={(e) => updateState({ 
              newClientData: { ...state.newClientData, email: e.target.value }
            })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new-client-phone">Telefone *</Label>
          <Input
            id="new-client-phone"
            value={state.newClientData.phone}
            onChange={(e) => updateState({ 
              newClientData: { ...state.newClientData, phone: e.target.value }
            })}
            className={state.errors.newClientPhone ? "border-destructive" : ""}
          />
          {state.errors.newClientPhone && (
            <p className="text-sm text-destructive">{state.errors.newClientPhone}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            updateState({ 
              isNewClient: false,
              newClientData: { name: "", email: "", phone: "" }
            });
          }}
        >
          Voltar
        </Button>
        
        <Button 
          type="button" 
          onClick={onSaveNewClient}
        >
          Próximo
        </Button>
      </div>
    </>
  );
}