// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import ContactHeader from "./contact-info/ContactHeader";
import ModernContactTabs from "./contact-info/ModernContactTabs";
// Removed old custom field imports - now handled in ModernContactTabs
import { optimizedContactsService } from "@/lib/optimizedContactsService";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Contact {
  id: string;
  contactId?: string; // id real do contato no Supabase (contacts)
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
  const [details, setDetails] = useState<Record<string, any> | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const confirmTimeoutRef = useRef<number | null>(null);
  const [pendingAction, setPendingAction] = useState<
    { type: "add"; value: string } | { type: "remove"; value: string } | null
  >(null);

  // Carrega detalhes do contato para garantir que tags do Supabase aparecem no header
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const realId = contact.contactId || contact.id;
        const d = await optimizedContactsService.fetchContactDetails(realId);
        if (isMounted) {
          setDetails(d);
          if (d?.tags) setTags(d.tags);
        }
      } catch (e) {
        console.error("Falha ao carregar detalhes do contato:", e);
      }
    })();
    return () => { isMounted = false; };
  }, [contact.id, contact.contactId]);

  // Realtime: manter sincronizado quando o contato for atualizado (nome/telefone/email/tags)
  useEffect(() => {
    const realId = contact.contactId || contact.id;
    const channel = supabase
      .channel('contacts-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'contacts', filter: `id=eq.${realId}` }, (payload: any) => {
        const record = payload.new || {};
        setDetails(prev => ({ ...(prev || {}), ...record }));
        if (Array.isArray(record.tags)) setTags(record.tags);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [contact.id, contact.contactId]);

  // Dados padronizados (prioriza detalhes carregados do Supabase)
  const unified = useMemo(() => ({
    name: details?.name ?? contact.name,
    avatar: details?.avatar ?? contact.avatar,
    status: contact.status,
    phone: details?.phone ?? contact.phone,
    email: details?.email ?? contact.email,
  }), [details, contact]);

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
          name: unified.name,
          avatar: unified.avatar,
          status: unified.status,
          phone: unified.phone,
          email: unified.email,
        }}
        tags={tags}
        newTag={newTag}
        onNewTagChange={setNewTag}
        onAddTag={() => {
          const value = newTag.trim();
          if (!value) return;
          setPendingAction({ type: "add", value });
          if (confirmTimeoutRef.current) window.clearTimeout(confirmTimeoutRef.current);
          confirmTimeoutRef.current = window.setTimeout(() => setIsConfirmOpen(true), 500);
        }}
        onRemoveTag={(tag) => {
          setPendingAction({ type: "remove", value: tag });
          if (confirmTimeoutRef.current) window.clearTimeout(confirmTimeoutRef.current);
          confirmTimeoutRef.current = window.setTimeout(() => setIsConfirmOpen(true), 500);
        }}
      />
      
      {/* Modern Contact Tabs */}
      <ModernContactTabs
        key={(details && (details as any).id) || contact.contactId || contact.id}
        contactId={(details && (details as any).id) || contact.contactId || contact.id}
        contact={{ ...contact, ...details, tags }}
        onFieldUpdate={(field, value) => {
          // Persistir no Supabase mapeando campos camelCase -> snake_case
          const realId = ((details && (details as any).id) || contact.contactId || contact.id) as string;
          const map: Record<string, string> = {
            name: 'name',
            email: 'email',
            phone: 'phone',
            address: 'address',
            notes: 'notes',
            clientName: 'client_name',
            clientSize: 'client_size',
            clientType: 'client_type',
            cpfCnpj: 'cpf_cnpj',
            responsibleHosts: 'responsible_hosts',
          };
          const dbField = map[String(field)] || String(field);
          optimizedContactsService
            .updateContact({ id: realId, [dbField]: value } as any)
            .then((updated) => {
              // Atualiza estado local com retorno da API
              setDetails(prev => ({ ...(prev || {}), ...updated }));
            })
            .catch((e) => {
              console.error('Falha ao salvar campo', field, e);
            });
        }}
      />
      {/* Confirmação para alterações nas tags */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === "add"
                ? `Deseja adicionar a tag "${pendingAction.value}"?`
                : `Deseja remover a tag "${pendingAction?.value}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingAction(null); setIsConfirmOpen(false); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!pendingAction) { setIsConfirmOpen(false); return; }
              try {
                let nextTags = tags;
                if (pendingAction.type === "add") {
                  nextTags = Array.from(new Set([...(tags || []), pendingAction.value]));
                } else if (pendingAction.type === "remove") {
                  nextTags = (tags || []).filter(t => t !== pendingAction.value);
                }
                // Persistir no Supabase
                const realId = contact.contactId || contact.id;
                await optimizedContactsService.updateContact({ id: realId, tags: nextTags });
                // Atualizar UI local e disparar callback
                updateTags(nextTags);
                if (pendingAction.type === "add") setNewTag("");
                // Atualizar detalhes unificados
                setDetails((prev: any) => ({ ...(prev || {}), tags: nextTags }));
              } catch (e) {
                console.error("Falha ao atualizar tags:", e);
              } finally {
                setPendingAction(null);
                setIsConfirmOpen(false);
              }
            }}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}