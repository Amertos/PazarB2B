import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/query-client';
import { useAuth } from './AuthContext';

export type PriceType = 'sale' | 'free';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  priceType: PriceType;
  price?: number;
  priceUnit?: string;
  location: string;
  images: string[];
  companyId: string;
  companyName: string;
  companyRating: number;
  companyReviewCount: number;
  quantity?: string;
  condition?: string;
  transport?: string;
  createdAt: string;
  isAvailable: boolean;
  viewCount?: number;
}

export const CATEGORIES = [
  { id: 'tekstil', label: 'Tekstil', icon: 'shirt-outline', color: '#4A90E2' },
  { id: 'drvo', label: 'Drvo', icon: 'leaf-outline', color: '#6B8E23' },
  { id: 'koza', label: 'Koža', icon: 'bag-outline', color: '#8B6914' },
  { id: 'plastika', label: 'Plastika', icon: 'cube-outline', color: '#9B4DCA' },
  { id: 'metal', label: 'Metal', icon: 'construct-outline', color: '#607D8B' },
  { id: 'staklo', label: 'Staklo', icon: 'water-outline', color: '#26A69A' },
  { id: 'papir', label: 'Papir', icon: 'document-outline', color: '#FF7043' },
  { id: 'elektronika', label: 'Elektronika', icon: 'hardware-chip-outline', color: '#455A64' },
];

interface ListingsContextValue {
  listings: Listing[];
  savedIds: string[];
  myListings: Listing[];
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'companyName' | 'companyRating' | 'companyReviewCount'>) => Promise<Listing>;
  deleteListing: (id: string) => Promise<void>;
  toggleSaved: (id: string) => Promise<void>;
  getListingById: (id: string) => Listing | undefined;
  refreshListings: () => Promise<void>;
  loadMoreListings: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
}

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const { company } = useAuth();
  const queryClient = useQueryClient();

  const { 
    data, 
    isLoading, 
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['listings'],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await apiRequest('GET', `/api/listings?limit=20&offset=${pageParam}`);
      return res.json() as Promise<Listing[]>;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  const listings = data ? data.pages.flat() : [];

  function loadMoreListings() {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }

  const { data: savedIds = [] } = useQuery({
    queryKey: ['savedListings', company?.id],
    queryFn: async () => {
      if (!company) return [];
      const res = await apiRequest('GET', '/api/listings/saved');
      return res.json() as Promise<string[]>;
    },
    enabled: !!company,
    staleTime: 5 * 60 * 1000,
  });

  const { data: myListings = [] } = useQuery({
    queryKey: ['myListings', company?.id],
    queryFn: async () => {
      if (!company) return [];
      const res = await apiRequest('GET', '/api/listings/mine');
      return res.json() as Promise<Listing[]>;
    },
    enabled: !!company,
    staleTime: 5 * 60 * 1000,
  });

  const addListingMutation = useMutation({
    mutationFn: async (data: Omit<Listing, 'id' | 'createdAt' | 'companyName' | 'companyRating' | 'companyReviewCount'>) => {
      const res = await apiRequest('POST', '/api/listings', data);
      return res.json() as Promise<Listing>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    }
  });

  async function addListing(data: any) {
    return addListingMutation.mutateAsync(data);
  }

  const deleteListingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    }
  });

  async function deleteListing(id: string) {
    return deleteListingMutation.mutateAsync(id);
  }

  const toggleSavedMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/listings/${id}/save`);
      return res.json() as Promise<{ saved: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedListings'] });
    }
  });

  async function toggleSaved(id: string) {
    await toggleSavedMutation.mutateAsync(id);
  }

  function getListingById(id: string) {
    return listings.find(l => l.id === id);
  }

  async function refreshListings() {
    await refetch();
    if (company) {
      await queryClient.invalidateQueries({ queryKey: ['savedListings'] });
      await queryClient.invalidateQueries({ queryKey: ['myListings'] });
    }
  }

  const value = useMemo(() => ({
    listings,
    savedIds,
    myListings,
    addListing,
    deleteListing,
    toggleSaved,
    getListingById,
    refreshListings,
    loadMoreListings,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    isLoading,
  }), [listings, savedIds, myListings, isLoading, hasNextPage, isFetchingNextPage]);

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error('useListings must be used within ListingsProvider');
  return ctx;
}
