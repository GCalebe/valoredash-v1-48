import { useState } from "react";
import { Contact } from "@/types/client";

export const useClientState = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isPauseDurationDialogOpen, setIsPauseDurationDialogOpen] =
    useState(false);
  const [messageText, setMessageText] = useState("");
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: "",
    email: "",
    phone: "",
    clientName: "",
    tags: [],
    notes: "",
    consultationStage: "Nova consulta",
  });

  const resetNewContact = () => {
    setNewContact({
      name: "",
      email: "",
      phone: "",
      clientName: "",
      tags: [],
      notes: "",
      consultationStage: "Nova consulta",
    });
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailSheetOpen(true);
  };

  const openEditModal = (contact?: Contact) => {
    const contactToEdit = contact || selectedContact;
    if (!contactToEdit) return;

    setSelectedContact(contactToEdit);
    setNewContact({
      name: contactToEdit.name,
      email: contactToEdit.email,
      phone: contactToEdit.phone,
      clientName: contactToEdit.clientName,
      tags: contactToEdit.tags || [],
      notes: contactToEdit.notes || "",
      consultationStage: contactToEdit.consultationStage || "Nova consulta",
      responsibleUser: contactToEdit.responsibleUser,
      sales: contactToEdit.sales,
      clientType: contactToEdit.clientType,
      clientSector: contactToEdit.clientSector,
      budget: contactToEdit.budget,
      paymentMethod: contactToEdit.paymentMethod,
      clientObjective: contactToEdit.clientObjective,
      lossReason: contactToEdit.lossReason,
      contractNumber: contactToEdit.contractNumber,
      contractDate: contactToEdit.contractDate,
      payment: contactToEdit.payment,
    });
    setIsEditModalOpen(true);
  };

  return {
    selectedContact,
    setSelectedContact,
    isAddContactOpen,
    setIsAddContactOpen,
    isDetailSheetOpen,
    setIsDetailSheetOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMessageDialogOpen,
    setIsMessageDialogOpen,
    isPauseDurationDialogOpen,
    setIsPauseDurationDialogOpen,
    messageText,
    setMessageText,
    newContact,
    setNewContact,
    resetNewContact,
    handleContactClick,
    openEditModal,
  };
};
