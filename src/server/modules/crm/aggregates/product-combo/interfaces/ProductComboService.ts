import { RequestParams, Service } from '@app/core';
import { ProductCombo, FindProductComboQuery, ProductComboRepository } from '@app/crm';
import { Application } from '@feathersjs/express';

export interface ProductComboService extends Service<ProductCombo, FindProductComboQuery, ProductComboRepository> {
  setup?: (app: Application<any>, path: string) => void;
  updateDetail: (id: string, data: Partial<ProductCombo>, params: RequestParams<ProductComboRepository>) => Promise<{}>;
  getAllRecords: (params: RequestParams<ProductComboRepository>) => Promise<{data: any[]}>;
}
