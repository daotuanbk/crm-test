export interface FindResult<T> {
  data: T[];
  // Number Paging System
  count?: number;
  pages?: number;
  limit?: number;
  page?: number;
  // Before - After Paging System
  before?: any; // query previous page
  after?: any; // query next page
}
