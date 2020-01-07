import { RequestParams, Service } from '@app/core';
import { SystemConfig, FindSystemConfigQuery, SystemConfigRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface SystemConfigService extends Service<SystemConfig, FindSystemConfigQuery, SystemConfigRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<SystemConfig>, params: RequestParams<SystemConfigRepository>) => Promise<{}>;
  getAllStages: (params: RequestParams<SystemConfigRepository>) => Promise<{data: any[]}>;
  getAllStatuses: (params: RequestParams<SystemConfigRepository>) => Promise<{data: any[]}>;
  getAllClassStages: (params: RequestParams<SystemConfigRepository>) => Promise<{data: any[]}>;
  getAllClassStatus: (params: RequestParams<SystemConfigRepository>) => Promise<{data: any[]}>;
  getAllContactStages: (params: RequestParams<SystemConfigRepository>) => Promise<{data: any[]}>;
  getAllContactStatuses: (params: RequestParams<SystemConfigRepository>) => Promise<{data: any[]}>;
}
