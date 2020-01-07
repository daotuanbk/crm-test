import { RequestParams, Service } from '@app/core';
import { LeadNotification, FindDetaulTaskQuery, LeadNotificationRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface LeadNotificationService extends Service<LeadNotification, FindDetaulTaskQuery, LeadNotificationRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<LeadNotification>, params: RequestParams<LeadNotificationRepository>) => Promise<{}>;
  check: (id: string, data: Partial<LeadNotification>, params: RequestParams<LeadNotificationRepository>) => Promise<boolean>;
  seen: (id: string, data: Partial<LeadNotification>, params: RequestParams<LeadNotificationRepository>) => Promise<any>;
  countUnseen: (params: RequestParams<LeadNotificationRepository>) => Promise<any>;
  markAllAsSeen: (id: string, data: Partial<LeadNotification>, params: RequestParams<LeadNotificationRepository>) => Promise<any>;
}
