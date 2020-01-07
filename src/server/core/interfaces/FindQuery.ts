export interface FindQuery {
  first?: number;
  limit?: number; // use either first or limit, but NOT both
  page?: number;
  sortBy: string; // fieldName|order, sample: username|asc
  before?: any; // query previous page
  after?: any; // query next page
  operation?: any; //
  fields?: any;
}
