// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { contactsService } from '@/lib/contactsService';
import { contactsKeys } from '@/lib/contactsQueryKeys';

export const useCreateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactsService.createContact,
    onSuccess: () => {
      // Invalidate only specific queries instead of all contacts queries
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      toast({
        title: "Success",
        description: "Contact created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactsService.updateContact,
    onSuccess: () => {
      // Invalidate only specific queries instead of all contacts queries
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactsService.deleteContact,
    onSuccess: () => {
      // Invalidate only specific queries instead of all contacts queries
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};