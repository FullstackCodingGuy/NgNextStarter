export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  field?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'currency' | 'percentage' | 'enum';
}

export interface FilterCriteria {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: FilterCriteria[];
}