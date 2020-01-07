import { Query } from '@app/core';
import { LeadPaymentTransaction, FindLeadPaymentTransactionQuery } from '@app/crm';

export interface LeadPaymentTransactionRepository {
  findById: (id: string) => Promise<LeadPaymentTransaction>;
  findOne: (query: Query) => Promise<LeadPaymentTransaction>;
  find: (query: FindLeadPaymentTransactionQuery) => Promise<LeadPaymentTransaction[]>;
  count: (query: Query) => Promise<number>;
  create: (entity: LeadPaymentTransaction) => Promise<string>;
  update: (entity: Partial<LeadPaymentTransaction>) => Promise<void>;
  del: (id: string) => Promise<void>;
  ensureIndexes: () => Promise<void>;
  delByCriteria: (criteria: any) => Promise<any>;
  syncPayDay: () => Promise<any>;
}
