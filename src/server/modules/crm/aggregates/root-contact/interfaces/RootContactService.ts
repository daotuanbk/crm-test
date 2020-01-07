import { RequestParams, Service } from '@app/core';
import { RootContact, FindDetaulTaskQuery, RootContactRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface RootContactService extends Service<RootContact, FindDetaulTaskQuery, RootContactRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<RootContact>, params: RequestParams<RootContactRepository>) => Promise<{}>;
  manualSynchronize: (id: string, data: Partial<RootContact>, params: RequestParams<RootContactRepository>) => Promise<{}>;
  mergeRootContacts: (id: string, data: Partial<RootContact>, params: RequestParams<RootContactRepository>) => Promise<{}>;
}
