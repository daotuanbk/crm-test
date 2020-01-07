import { Repository, FindResult } from '@app/core';
import { LeadAttachment, FindLeadAttachmentQuery } from '@app/crm';

export interface LeadAttachmentRepository extends Repository<LeadAttachment> {
  find: (query: FindLeadAttachmentQuery) => Promise<FindResult<LeadAttachment>>;
  getByFbConversationId: (fbConversationId: string) => Promise<LeadAttachment>;
  findByLeadOrContactId: (leadId?: string, contactId?: string) => Promise<any>;
  updateLeadId: (contactId: string, leadId: string) => Promise<void>;
}
