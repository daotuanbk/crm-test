import { RequestParams, Service } from '@app/core';
import { LeadMessageDetail, FindLeadMessageDetailQuery, LeadMessageDetailRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface LeadMessageDetailService extends Service<LeadMessageDetail, FindLeadMessageDetailQuery, LeadMessageDetailRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<LeadMessageDetail>, params: RequestParams<LeadMessageDetailRepository>) => Promise<{}>;
  getByFbConversationId: (fbConversationId: string) => Promise<LeadMessageDetail>;
  syncEmailMessage: (leadId: string) => Promise<void>;
}
