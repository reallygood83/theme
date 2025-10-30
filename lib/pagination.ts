// 페이지네이션 유틸리티

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

export function createPaginationResult<T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      limit
    }
  };
}

export function validatePaginationParams(page?: string, limit?: string): PaginationOptions {
  const defaultPage = 1;
  const defaultLimit = 20;
  const maxLimit = 100;

  const parsedPage = page ? parseInt(page, 10) : defaultPage;
  const parsedLimit = limit ? parseInt(limit, 10) : defaultLimit;

  return {
    page: Math.max(1, isNaN(parsedPage) ? defaultPage : parsedPage),
    limit: Math.min(maxLimit, Math.max(1, isNaN(parsedLimit) ? defaultLimit : parsedLimit))
  };
}