import { Repository, FindResult } from '@app/core';
import { Contact, FindContactQuery } from '@app/crm';

export interface ContactRepository extends Repository<Contact> {
  find: (query: FindContactQuery) => Promise<FindResult<Contact>>;
  summary: (payload: string) => Promise<any>;
  findInArrayId: (payload: any) => Promise<any>;
  findByCriteria: (payload: any) => Promise<any>;
  findAll: () => Promise<Contact[]>;
}
