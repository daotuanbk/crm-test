import { RequestParams, Service } from '@app/core';
import { LeadPaymentTransaction, FindLeadPaymentTransactionQuery, LeadPaymentTransactionRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface LeadPaymentTransactionService extends Service<LeadPaymentTransaction, FindLeadPaymentTransactionQuery, LeadPaymentTransactionRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<LeadPaymentTransaction>, params: RequestParams<LeadPaymentTransactionRepository>) => Promise<{}>;
}
