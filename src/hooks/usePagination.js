import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

/**
 * Hook para paginación básica
 */
export function usePagination({
  queryKey,
  queryFn,
  pageSize = 10,
  enabled = true,
  staleTime = 5 * 60 * 1000,
  gcTime = 10 * 60 * 1000
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: [...queryKey, currentPage, pageSize, searchTerm, sortBy, sortOrder],
    queryFn: () => queryFn({
      page: currentPage,
      pageSize,
      search: searchTerm,
      sortBy,
      sortOrder
    }),
    enabled,
    staleTime,
    gcTime,
    keepPreviousData: true
  });

  const totalPages = Math.ceil((data?.total || 0) / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  const search = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const sort = (field, order = 'asc') => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  return {
    // Data
    data: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error,
    isFetching,
    
    // Pagination state
    currentPage,
    totalPages,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    
    // Pagination actions
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    
    // Search and sort
    searchTerm,
    search,
    sortBy,
    sortOrder,
    sort,
    toggleSort,
    
    // Utils
    refetch
  };
}

/**
 * Hook para scroll infinito
 */
export function useInfiniteScroll({
  queryKey,
  queryFn,
  pageSize = 20,
  enabled = true,
  staleTime = 5 * 60 * 1000,
  gcTime = 10 * 60 * 1000
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: [...queryKey, pageSize, searchTerm, sortBy, sortOrder],
    queryFn: ({ pageParam = 1 }) => queryFn({
      page: pageParam,
      pageSize,
      search: searchTerm,
      sortBy,
      sortOrder
    }),
    enabled,
    staleTime,
    gcTime,
    getNextPageParam: (lastPage, pages) => {
      const totalPages = Math.ceil(lastPage.total / pageSize);
      const currentPage = pages.length;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    }
  });

  // Flatten all pages into a single array
  const items = useMemo(() => {
    return data?.pages?.flatMap(page => page.items) || [];
  }, [data]);

  const total = data?.pages?.[0]?.total || 0;

  const search = (term) => {
    setSearchTerm(term);
  };

  const sort = (field, order = 'asc') => {
    setSortBy(field);
    setSortOrder(order);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return {
    // Data
    items,
    total,
    isLoading,
    error,
    
    // Infinite scroll
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    
    // Search and sort
    searchTerm,
    search,
    sortBy,
    sortOrder,
    sort,
    toggleSort,
    
    // Utils
    refetch
  };
}

/**
 * Hook para filtros avanzados
 */
export function useAdvancedFilters({
  queryKey,
  queryFn,
  initialFilters = {},
  pageSize = 10,
  enabled = true
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: [...queryKey, filters, currentPage, pageSize],
    queryFn: () => queryFn({
      filters,
      page: currentPage,
      pageSize
    }),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    keepPreviousData: true
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const removeFilter = (key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key] !== undefined && 
    filters[key] !== null && 
    filters[key] !== ''
  );

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return {
    // Data
    data: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error,
    isFetching,
    
    // Filters
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters,
    
    // Pagination
    currentPage,
    totalPages,
    setCurrentPage,
    
    // Utils
    refetch
  };
}
