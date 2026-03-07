export interface PaginationResponse<T> {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    items: T;
    totalCount: number;
}
