import { Repository, FindResult } from '@app/core';
import { LeadHistory, FindLeadHistoryQuery } from '@app/crm';

export interface LeadHistoryRepository extends Repository<LeadHistory> {
  find: (query: FindLeadHistoryQuery) => Promise<FindResult<LeadHistory>>;
  findAll: () => Promise<any>;
}
