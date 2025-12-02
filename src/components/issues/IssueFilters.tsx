/**
 * IssueFilters - Search, status filter, and sort controls
 */
'use client';

import { useState, useEffect } from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IssueFilters } from '@/types/linear';
import { useDebounce } from '@/hooks/use-debounce';

interface IssueFiltersProps {
  filters: IssueFilters;
  onFiltersChange: (filters: IssueFilters) => void;
  workflowStates: Array<{ id: string; name: string; type: string; color: string }>;
  isLoading?: boolean;
}

export function IssueFilters({
  filters,
  onFiltersChange,
  workflowStates,
  isLoading = false
}: IssueFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchValue, 500);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value,
    });
  };

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split('-') as [typeof filters.sort, typeof filters.order];
    onFiltersChange({
      ...filters,
      sort,
      order,
    });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };

  const hasActiveFilters = filters.status || filters.search || filters.sort;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search issues by title or description..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-10"
          disabled={isLoading}
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <Select
            value={filters.status || 'all'}
            onValueChange={handleStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {workflowStates.map(state => (
                <SelectItem key={state.id} value={state.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: state.color }}
                    />
                    {state.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sort:</span>
          <Select
            value={filters.sort ? `${filters.sort}-${filters.order || 'desc'}` : 'updated-desc'}
            onValueChange={handleSortChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated-desc">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3 w-3" />
                  Recently Updated
                </div>
              </SelectItem>
              <SelectItem value="updated-asc">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3 w-3" />
                  Oldest Updated
                </div>
              </SelectItem>
              <SelectItem value="created-desc">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3 w-3" />
                  Recently Created
                </div>
              </SelectItem>
              <SelectItem value="created-asc">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3 w-3" />
                  Oldest Created
                </div>
              </SelectItem>
              <SelectItem value="priority-asc">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3 w-3" />
                  Priority (High to Low)
                </div>
              </SelectItem>
              <SelectItem value="priority-desc">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3 w-3" />
                  Priority (Low to High)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="text-sm text-gray-600">
          {filters.search && (
            <span>Searching for &quot;{filters.search}&quot; • </span>
          )}
          {filters.status && (
            <span>
              Status: {workflowStates.find(s => s.id === filters.status)?.name} •
            </span>
          )}
          {filters.sort && (
            <span>
              Sorted by {filters.sort} ({filters.order})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
