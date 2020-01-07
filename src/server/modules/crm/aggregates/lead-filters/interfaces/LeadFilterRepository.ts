import { Repository, FindResult } from '@app/core';
import { LeadFilter, FindLeadFiltersQuery } from '@app/crm';

export interface LeadFiltersRepository extends Repository<LeadFilter> {
  find: (query: FindLeadFiltersQuery) => Promise<FindResult<LeadFilter>>;
  findOne: (query: any) => Promise<LeadFilter>;
  findAll: (owner: string) => Promise<LeadFilter[]>;
}
