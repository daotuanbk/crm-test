import { RequestParams, Service } from '@app/core';
import { LeadTask, FindLeadTaskQuery, LeadTaskRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface LeadTaskService extends Service<LeadTask, FindLeadTaskQuery, LeadTaskRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<LeadTask>, params: RequestParams<LeadTaskRepository>) => Promise<{}>;
  del: (id: string, params: RequestParams<LeadTaskRepository>) => Promise<{}>;
}
