import { Repository, FindResult } from '@app/core';
import { LeadMessageDetail, FindLeadMessageDetailQuery } from '@app/crm';

export interface LeadMessageDetailRepository extends Repository<LeadMessageDetail> {
  find: (query: FindLeadMessageDetailQuery) => Promise<FindResult<LeadMessageDetail>>;
  findLeadStageStatusByStageId: (id: string) => Promise<any>;
  findLeadStages: () => Promise<any>;
  findLeadStageStatus: () => Promise<any>;
  findProspectingSources: () => Promise<any>;
  getByFbConversationId: (fbConversationId: string) => Promise<LeadMessageDetail>;
  findByQuery: (query: any) => Promise<any>;
  delByCriteria: (criteria: any) => Promise<void>;
}
