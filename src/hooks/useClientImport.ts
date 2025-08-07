import { useState } from "react";
import { Contact } from "@/types/client";

export const useClientImport = () => {
  const [isMethodSelectionOpen, setIsMethodSelectionOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  const handleNewClientClick = () => {
    setIsMethodSelectionOpen(true);
  };

  const handleSelectManual = () => {
    setIsMethodSelectionOpen(false);
    setIsAddClientOpen(true);
  };

  const handleSelectImport = () => {
    setIsMethodSelectionOpen(false);
    setIsImportModalOpen(true);
  };

  const handleBackToSelection = () => {
    setIsImportModalOpen(false);
    setIsMethodSelectionOpen(true);
  };

  const handleCloseAll = () => {
    setIsMethodSelectionOpen(false);
    setIsImportModalOpen(false);
    setIsAddClientOpen(false);
  };

  return {
    isMethodSelectionOpen,
    isImportModalOpen,
    isAddClientOpen,
    setIsAddClientOpen,
    handleNewClientClick,
    handleSelectManual,
    handleSelectImport,
    handleBackToSelection,
    handleCloseAll,
  };
};