import { useEffect } from 'react';
import { format, parse, parseISO } from 'date-fns';
import { Contact } from '@/types/client';
import { EventFormData, CalendarEvent } from '@/hooks/useCalendarEvents';
import { useOptimizedContactsData } from '@/hooks/useOptimizedContactsData';
import { useEventFormState } from '@/hooks/useEventFormState';
import { EventFormState } from '@/types/eventForm';
import { COLORS, SERVICES, COLLABORATORS, DURATIONS, ATTENDANCE_TYPES } from '@/constants/eventFormConstants';
import { 
  validateForm, 
  validateNewClientData, 
  validateServiceSelection, 
  validateDateTimeSelection 
} from '@/utils/eventFormValidation';
import {
  createBlockedDateDescription,
  createRegularEventDescription,
  prepareFormData,
  addTag as addTagHelper,
  removeTag as removeTagHelper,
  extractTags
} from '@/utils/eventFormHelpers';

interface UseEventFormDialogProps {
  event?: CalendarEvent;
  open: boolean;
}

export const useEventFormDialog = ({ event, open }: UseEventFormDialogProps) => {
  const { contacts } = useOptimizedContactsData();
  const { state, updateState, resetForm: resetFormState } = useEventFormState();

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(
    contact => 
      contact.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(state.searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.includes(state.searchTerm))
  );


  // Set basic event information from existing event
  const setBasicEventInfo = (event: CalendarEvent) => {
    const start = parseISO(event.start);
    const end = parseISO(event.end);
    const durationInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    updateState({
      summary: event.summary || "",
      automation: "",
      collaborator: event.hostName || "",
      eventDescription: event.description || "",
      email: event.attendees?.find((a) => a?.email)?.email || "",
      startDateTime: format(start, "yyyy-MM-dd'T'HH:mm"),
      endDateTime: format(end, "yyyy-MM-dd'T'HH:mm"),
      selectedColor: COLORS[0],
      selectedDuration: durationInMinutes,
    });
  };

  // Find service information from event description
  const findServiceInfo = (event: CalendarEvent) => {
    const foundService = SERVICES.find(service => 
      event.summary?.includes(service) || event.description?.includes(service)
    );
    
    if (foundService) {
      updateState({ selectedService: foundService });
    }
  };

  // Find client information from event attendees
  const findClientInfo = (event: CalendarEvent) => {
    const clientEmail = event.attendees?.find((a) => a?.email)?.email;
    if (clientEmail) {
      const foundClient = contacts.find(c => c.email === clientEmail);
      if (foundClient) {
        updateState({
          selectedClient: foundClient,
          isNewClient: false,
        });
      }
    }
  };

  // Determine attendance type and location/link from event description
  const determineAttendanceInfo = (event: CalendarEvent) => {
    if (event.description?.toLowerCase().includes("online") || 
        event.description?.toLowerCase().includes("zoom") || 
        event.description?.toLowerCase().includes("meet")) {
      // Try to extract meeting link
      const linkMatch = event.description?.match(/(https?:\/\/[^\s]+)/);
      
      updateState({
        attendanceType: "online",
        meetingLink: linkMatch ? linkMatch[0] : "",
      });
    } else {
      // Try to extract location
      const locationLines = event.description?.split('\n').filter(line => 
        line.toLowerCase().includes("local") || 
        line.toLowerCase().includes("endereço") ||
        line.toLowerCase().includes("localização")
      );
      
      updateState({
        attendanceType: "presencial",
        location: locationLines && locationLines.length > 0 ?
          locationLines[0].replace(/local|endereço|localização/i, "").trim() : "",
      });
    }
  };

  // Check if date is blocked and extract reason
  const checkBlockedDate = (event: CalendarEvent) => {
    if (event.summary?.toLowerCase().includes("bloqueado") || 
        event.description?.toLowerCase().includes("bloqueado")) {
      // Try to extract block reason
      const reasonLines = event.description?.split('\n').filter(line => 
        line.toLowerCase().includes("motivo") || 
        line.toLowerCase().includes("razão")
      );
      
      updateState({
        isBlockingDate: true,
        blockReason: reasonLines && reasonLines.length > 0 ?
          reasonLines[0].replace(/motivo|razão/i, "").trim() : "",
      });
    }
  };


  // Determine initial status from event status
  const determineInitialStatus = (event: CalendarEvent) => {
    if (event.status === "confirmed") {
      updateState({ initialStatus: "confirmado" });
    } else if (event.status === "tentative") {
      updateState({ initialStatus: "pendente" });
    }
  };

  const validateFormLocal = (): boolean => {
    return validateForm(state);
  };

  // Event handlers
  const handleSubmit = (e: React.FormEvent): EventFormData | null => {
    e.preventDefault();
    
    if (!validateFormLocal()) {
      return null;
    }
    
    const startDate = state.startDateTime ? 
      parse(state.startDateTime, "yyyy-MM-dd'T'HH:mm", new Date()) : new Date();
    const endDate = new Date(startDate.getTime() + state.selectedDuration * 60 * 1000);
    
    let eventInfo;
    if (state.isBlockingDate) {
      eventInfo = createBlockedDateDescription(state);
    } else {
      eventInfo = createRegularEventDescription(state);
    }
    
    return prepareFormData(eventInfo.summary, eventInfo.description, startDate, endDate, state);
  };

  const handleSelectClient = (contact: Contact) => {
    updateState({
      selectedClient: contact,
      isNewClient: false,
      email: contact.email || "",
      searchTerm: "",
      activeTab: "service"
    });
  };

  const handleNewClient = () => {
    updateState({
      isNewClient: true,
      selectedClient: null
    });
  };

  const validateNewClientDataLocal = (): boolean => {
    return validateNewClientData(state);
  };

  const handleSaveNewClient = () => {
    if (validateNewClientDataLocal()) {
      updateState({
        email: state.newClientData.email,
        activeTab: "service"
      });
    }
  };

  const validateServiceSelectionLocal = (): boolean => {
    return validateServiceSelection(state);
  };

  const handleServiceNext = () => {
    if (validateServiceSelectionLocal()) {
      updateState({ activeTab: "datetime" });
    }
  };

  const validateDateTimeSelectionLocal = (): boolean => {
    return validateDateTimeSelection(state);
  };

  const handleDateTimeNext = () => {
    if (validateDateTimeSelectionLocal()) {
      updateState({ activeTab: "attendance" });
    }
  };

  const updateEndTime = () => {
    if (state.startDateTime) {
      const startDate = parse(state.startDateTime, "yyyy-MM-dd'T'HH:mm", new Date());
      const endDate = new Date(startDate.getTime() + state.selectedDuration * 60 * 1000);
      updateState({ endDateTime: format(endDate, "yyyy-MM-dd'T'HH:mm") });
    }
  };

  const addTag = () => {
    addTagHelper(state, updateState);
  };

  const removeTag = (id: string) => {
    removeTagHelper(id, state, updateState);
  };

  const handleDeleteDialogOpen = () => {
    updateState({ isDeleteDialogOpen: true });
  };

  const handleDeleteDialogClose = () => {
    updateState({ isDeleteDialogOpen: false });
  };

  // Load event data when event changes or dialog opens
  useEffect(() => {
    if (event && open) {
      setBasicEventInfo(event);
      findServiceInfo(event);
      findClientInfo(event);
      determineAttendanceInfo(event);
      checkBlockedDate(event);
      const extractedTags = extractTags(event.description);
      updateState({ tags: extractedTags });
      determineInitialStatus(event);
    } else if (!open) {
      resetFormState();
    }
  }, [event, open, contacts]);

  // Update end time when start time or duration changes
  useEffect(() => {
    updateEndTime();
  }, [, updateEndTime]);

  return {
    // State
    state,
    updateState,
    filteredContacts,
    constants: {
      COLORS,
      SERVICES,
      COLLABORATORS,
      DURATIONS,
      ATTENDANCE_TYPES,
    },
    
    // Validation
    validateForm: validateFormLocal,
    validateNewClientData: validateNewClientDataLocal,
    validateServiceSelection: validateServiceSelectionLocal,
    validateDateTimeSelection: validateDateTimeSelectionLocal,
    
    // Event handlers
    handleSubmit,
    handleSelectClient,
    handleNewClient,
    handleSaveNewClient,
    handleServiceNext,
    handleDateTimeNext,
    addTag,
    removeTag,
    handleDeleteDialogOpen,
    handleDeleteDialogClose,
    
    // Helper functions
    resetForm: resetFormState,
    updateEndTime,
  };
};

export default useEventFormDialog;