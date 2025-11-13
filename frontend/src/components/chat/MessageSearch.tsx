import React, { useRef, useState } from 'react';
import { useMessageSearch } from '../stores/messageSearch';
import { CalendarIcon, ChevronDownIcon, ChevronUpIcon, SearchIcon, XIcon } from '@heroicons/react/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const MessageSearch: React.FC = () => {
  const searchState = useMessageSearch();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchState.query.trim()) {
      searchState.setIsSearching(true);
      // TODO: Implement actual search logic here
      // This would typically involve calling your backend API
      searchState.setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 bg-white rounded shadow">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            type="text"
            value={searchState.query}
            onChange={(e) => searchState.setQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-8 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <SearchIcon className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
          {searchState.query && (
            <button
              type="button"
              onClick={() => searchState.clearSearch()}
              className="absolute right-2 top-2.5"
            >
              <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="p-2 border rounded hover:bg-gray-50"
        >
          <CalendarIcon className="h-5 w-5 text-gray-600" />
        </button>
      </form>

      {showDatePicker && (
        <div className="relative">
          <DatePicker
            selected={searchState.selectedDate}
            onChange={(date) => {
              searchState.setSelectedDate(date);
              setShowDatePicker(false);
            }}
            inline
          />
        </div>
      )}

      {/* Search Filters */}
      <div className="flex gap-2 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={searchState.filters.hasFiles}
            onChange={(e) => searchState.setFilters({ hasFiles: e.target.checked })}
          />
          Has files
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={searchState.filters.isStarred}
            onChange={(e) => searchState.setFilters({ isStarred: e.target.checked })}
          />
          Starred
        </label>
      </div>

      {/* Search Results Navigation */}
      {searchState.results.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {searchState.currentResultIndex + 1} of {searchState.results.length} results
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => searchState.previousResult()}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => searchState.nextResult()}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {searchState.isSearching && (
        <div className="text-center text-gray-600">
          Searching...
        </div>
      )}
    </div>
  );
};

export default MessageSearch;