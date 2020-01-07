import { RequestParams, Service } from '@app/core';
import { LeadHistory, FindLeadHistoryQuery, LeadHistoryRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface LeadHistoryService extends Service<LeadHistory, FindLeadHistoryQuery, LeadHistoryRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<LeadHistory>, params: RequestParams<LeadHistoryRepository>) => Promise<{}>;
  del: (id: string, params: RequestParams<LeadHistoryRepository>) => Promise<{}>;
}
