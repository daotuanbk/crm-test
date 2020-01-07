import { Repository, FindResult } from '@app/core';
import { LeadTask, FindLeadTaskQuery } from '@app/crm';

export interface LeadTaskRepository extends Repository<LeadTask> {
  find: (query: FindLeadTaskQuery) => Promise<FindResult<LeadTask>>;
  findAll: () => Promise<any>;
  findByLeadId: (leadId: string) => Promise<any>;
  findOverdueRecords: () => Promise<LeadTask[]>;
}
