import { RequestParams, Service } from '@app/core';
import { ProspectingList, FindDetaulTaskQuery, ProspectingListRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface ProspectingListService extends Service<ProspectingList, FindDetaulTaskQuery, ProspectingListRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<ProspectingList>, params: RequestParams<ProspectingListRepository>) => Promise<{}>;
}
