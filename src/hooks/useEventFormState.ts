import { useState } from 'react';
import { EventFormState } from '@/types/eventForm';
import { COLORS, SERVICES } from '@/constants/eventFormConstants';

export const useEventFormState = () => {
  // Initialize state with default values
  const [state, setState] = useState<EventFormState>({
    activeTab: "client",
    summary: "",
    automation: "",
    collaborator: "",
    eventDescription: "",
    email: "",
    startDateTime: "",
    endDateTime: "",
    selectedColor: COLORS[0],
    selectedService: SERVICES[0],
    selectedDuration: 60,
    attendanceType: "presencial",
    location: "",
    meetingLink: "",
    searchTerm: "",
    selectedClient: null,
    selectedAgendaId: undefined,
    isNewClient: false,
    newClientData: {
      name: "",
      email: "",
      phone: "",
    },
    isBlockingDate: false,
    blockReason: "",
    tags: [],
    newTag: "",
    newTagColor: "#3b82f6",
    initialStatus: "confirmado",
    isDeleteDialogOpen: false,
    errors: {},
  });

  // Helper function to update state
  const updateState = (updates: Partial<EventFormState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setState({
      activeTab: "client",
      summary: "",
      automation: "",
      collaborator: "",
      eventDescription: "",
      email: "",
      startDateTime: "",
      endDateTime: "",
      selectedColor: COLORS[0],
      selectedService: SERVICES[0],
      selectedDuration: 60,
      attendanceType: "presencial",
      location: "",
      meetingLink: "",
      searchTerm: "",
      selectedClient: null,
      selectedAgendaId: undefined,
      isNewClient: false,
      newClientData: {
        name: "",
        email: "",
        phone: "",
      },
      isBlockingDate: false,
      blockReason: "",
      tags: [],
      newTag: "",
      newTagColor: "#3b82f6",
      initialStatus: "confirmado",
      isDeleteDialogOpen: false,
      errors: {},
    });
  };

  return {
    state,
    updateState,
    resetForm,
  };
};