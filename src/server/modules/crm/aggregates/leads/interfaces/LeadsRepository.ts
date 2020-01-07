import { Repository, FindResult } from '@app/core';
import {
  Lead,
  LeadOrder,
  LeadPayment,
  LeadRefund,
  LeadTuition,
  FindLeadsQuery,
  OrderProductItem,
} from '@app/crm';

export interface LeadsRepository extends Repository<Lead> {
  findByCriteria: (query: any, populate?: any[]) => Promise<Lead[]>;
  find: (query: FindLeadsQuery) => Promise<FindResult<Lead>>;
  findOne: (query: any, populate?: any[]) => Promise<Lead>;
  updateByCriteria: (criteria: any, payload: any) => Promise<any>;
  findAll: () => Promise<Lead[]>;
  updateOrder: (id: string, newOrder: LeadOrder) => Promise<Lead>;
  pushPayment: (id: string, newPayment: LeadPayment) => Promise<Lead>;
  pushRefund: (id: string, newRefund: LeadRefund) => Promise<Lead>;
  updateTuition: (id: string, tuition: LeadTuition) => Promise<Lead>;
  updateOneOwner: (_id: string, owner: any) => Promise<Lead>;
  pushOrderProductItem: (_id: string, orderProductItem: OrderProductItem) => Promise<Lead>;
  pullOrderProductItem: (_id: string, orderProductItemId: string) => Promise<Lead>;
  setOrderProductItem: (_id: string, orderProductItem: OrderProductItem) => Promise<Lead>;
}
