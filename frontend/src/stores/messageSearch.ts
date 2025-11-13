import { create } from 'zustand';
import { Message } from './chat';

interface SearchState {
  query: string;
  results: Message[];
  isSearching: boolean;
  selectedDate: Date | null;
  filters: {
    hasFiles: boolean;
    fromUser: string | null;
    isStarred: boolean;
  };
  currentResultIndex: number;
  // Actions
  setQuery: (query: string) => void;
  setResults: (results: Message[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSelectedDate: (date: Date | null) => void;
  setFilters: (filters: Partial<SearchState['filters']>) => void;
  nextResult: () => void;
  previousResult: () => void;
  clearSearch: () => void;
}

export const useMessageSearch = create<SearchState>((set) => ({
  query: '',
  results: [],
  isSearching: false,
  selectedDate: null,
  filters: {
    hasFiles: false,
    fromUser: null,
    isStarred: false,
  },
  currentResultIndex: -1,

  setQuery: (query) => set({ query }),
  
  setResults: (results) => set({ 
    results,
    currentResultIndex: results.length > 0 ? 0 : -1,
  }),
  
  setIsSearching: (isSearching) => set({ isSearching }),
  
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),
  
  nextResult: () => set((state) => ({
    currentResultIndex: state.currentResultIndex < state.results.length - 1
      ? state.currentResultIndex + 1
      : 0,
  })),
  
  previousResult: () => set((state) => ({
    currentResultIndex: state.currentResultIndex > 0
      ? state.currentResultIndex - 1
      : state.results.length - 1,
  })),
  
  clearSearch: () => set({
    query: '',
    results: [],
    isSearching: false,
    selectedDate: null,
    filters: {
      hasFiles: false,
      fromUser: null,
      isStarred: false,
    },
    currentResultIndex: -1,
  }),
}));