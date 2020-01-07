import { RequestParams, Service } from '@app/core';
import { LeadProductOrder, FindLeadProductOrderQuery, LeadProductOrderRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface LeadProductOrderService extends Service<LeadProductOrder, FindLeadProductOrderQuery, LeadProductOrderRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<LeadProductOrder>, params: RequestParams<LeadProductOrderRepository>) => Promise<{}>;
  updateCourses: (id: string, data: any, params: RequestParams<LeadProductOrderRepository>) => Promise<{}>;
  deleteCourse: (id: string, data: any, params: RequestParams<LeadProductOrderRepository>) => Promise<{}>;
  addCourse: (id: string, data: any, params: RequestParams<LeadProductOrderRepository>) => Promise<{}>;
  addCombo: (id: string, data: any, params: RequestParams<LeadProductOrderRepository>) => Promise<{}>;
  removeCombo: (id: string, data: any, params: RequestParams<LeadProductOrderRepository>) => Promise<{}>;
}
