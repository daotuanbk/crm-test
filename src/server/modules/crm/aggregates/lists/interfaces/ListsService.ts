import { RequestParams, Service } from '@app/core';
import { List, FindListsQuery, ListsRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface ListsService extends Service<List, FindListsQuery, ListsRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<List>, params: RequestParams<ListsRepository>) => Promise<{}>;
}
