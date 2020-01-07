import { RequestParams, Service } from '@app/core';
import { Class, FindClassQuery, ClassRepository } from '@app/crm';

export interface ClassService extends Service<Class, FindClassQuery, ClassRepository> {
  setup: (app: any, path: string) => any;
  updateDetail: (id: string, data: Partial<Class>, params: RequestParams<ClassRepository>) => Promise<{}>;
  getAllRecords: (params: RequestParams<ClassRepository>) => Promise<{data: any[]}>;
  synchronize: () => Promise<any>;
}
