export interface ApiResponse<TData> {
  readonly succeeded: boolean;
  readonly message: string;
  readonly errors: readonly string[];
  readonly data: TData;
  readonly correlationId?: string;
  readonly pagination?: import('./pagination.model').PaginationMetadata;
}
