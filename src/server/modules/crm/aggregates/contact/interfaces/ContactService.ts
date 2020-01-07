import { RequestParams, Service } from '@app/core';
import { Contact, FindContactQuery, ContactRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface ContactService extends Service<Contact, FindContactQuery, ContactRepository> {
  setup: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<Contact>, params: RequestParams<ContactRepository>) => Promise<{}>;
  addFamilyMember: (id: string, data: any, params: RequestParams<ContactRepository>) => Promise<{}>;
}
