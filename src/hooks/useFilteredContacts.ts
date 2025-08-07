import { useInfiniteQuery } from "@tanstack/react-query";
import { contactsService } from "@/lib/contactsService";
import { useUnifiedClientFilters } from "./useUnifiedClientFilters";
import { Contact } from "@/types/client";

export interface UseFilteredContactsOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UseFilteredContactsResult {
  contacts: Contact[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

export function useFilteredContacts(
  options: UseFilteredContactsOptions = {}
): UseFilteredContactsResult {
  const { enabled = true, refetchInterval } = options;
  const filters = useUnifiedClientFilters();
  const contactFilters = filters.getContactFilters();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["contacts", "filtered", contactFilters],
    queryFn: async ({ pageParam = null }) => {
      const result = await contactsService.fetchContactsPaginated({
        ...contactFilters,
        cursor: pageParam,
        limit: 50,
      });
      return result;
    },
    enabled,
    refetchInterval,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialPageParam: null,
  });

  // Flatten paginated results
  const contacts = data?.pages?.flatMap((page) => page.data) || [];

  return {
    contacts,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    hasNextPage: hasNextPage || false,
    fetchNextPage,
    isFetchingNextPage,
  };
}