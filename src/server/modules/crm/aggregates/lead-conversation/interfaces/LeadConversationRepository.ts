import { Repository, FindResult } from '@app/core';
import { LeadConversation, FindLeadConversationQuery } from '@app/crm';

export interface LeadConversationRepository extends Repository<LeadConversation> {
  find: (query: FindLeadConversationQuery) => Promise<FindResult<LeadConversation>>;
  findLeadStageStatusByStageId: (id: string) => Promise<any>;
  findLeadStages: () => Promise<any>;
  findLeadStageStatus: () => Promise<any>;
  findProspectingSources: () => Promise<any>;
  getByFbConversationId: (fbConversationId: string) => Promise<LeadConversation>;
  getByLeadId: (leadId: string) => Promise<LeadConversation[]>;
  getByContactId: (contactId: string) => Promise<LeadConversation>;
  updateLeadId: (contactId: string, leadId: string) => Promise<void>;
  findOneByQuery: (query: any) => Promise<LeadConversation>;
  findByQuery: (query: any) => Promise<LeadConversation[]>;
}
