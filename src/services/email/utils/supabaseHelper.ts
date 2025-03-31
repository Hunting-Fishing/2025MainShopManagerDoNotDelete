
/**
 * Generic response interface for service methods
 */
export interface GenericResponse<T> {
  data: T | null;
  error: any;
}
