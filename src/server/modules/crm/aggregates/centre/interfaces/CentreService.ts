import { RequestParams, Service } from '@app/core';
import { Centre, FindCentreQuery, CentreRepository } from '@app/crm';

export interface CentreService extends Service<Centre, FindCentreQuery, CentreRepository> {
  setup: (app: any, path: string) => any;
  updateDetail: (id: string, data: Partial<Centre>, params: RequestParams<CentreRepository>) => Promise<{}>;
  getAllRecords: (params: RequestParams<CentreRepository>) => Promise<{data: any[]}>;
  synchronize: () => Promise<any>;
}
