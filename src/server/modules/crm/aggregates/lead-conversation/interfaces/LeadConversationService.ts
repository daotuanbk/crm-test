import { Nullable, RequestParams, Service } from '@app/core';
import { LeadConversation, FindLeadConversationQuery, LeadConversationRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface LeadConversationService extends Service<LeadConversation, FindLeadConversationQuery, LeadConversationRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<LeadConversation>, params: RequestParams<LeadConversationRepository>) => Promise<{}>;
  getAllStages: (params: RequestParams<LeadConversationRepository>) => Promise<{data: any[]}>;
  getAllStatuses: (params: RequestParams<LeadConversationRepository>) => Promise<{data: any[]}>;
  getByFbConversationId: (fbConversationId: string) => Promise<Nullable<LeadConversation>>;
  getByEmail: (email: string) => Promise<Nullable<LeadConversation>>;
}
