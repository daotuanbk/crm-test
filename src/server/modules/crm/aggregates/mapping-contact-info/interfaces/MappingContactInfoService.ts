import { RequestParams, Service } from '@app/core';
import { MappingContactInfo, FindMappingContactInfoQuery, MappingContactInfoRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface MappingContactInfoService extends Service<MappingContactInfo, FindMappingContactInfoQuery, MappingContactInfoRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<MappingContactInfo>, params: RequestParams<MappingContactInfoRepository>) => Promise<{}>;
  findLeadsAndTransactions: (params: any) => Promise<any>;
  syncLmsId: (id: string, data: any, params: any) => Promise<any>;
  removeLmsStudent: (id: string, data: any, params: any) => Promise<any>;
  findByKey: (payload: any) => Promise<any>;
}
