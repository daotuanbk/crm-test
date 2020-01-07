import { PatchPayload, RequestParams, validateOperation } from '@app/core';
import { ProductsRepository } from '@app/crm';
import _ from 'lodash';
import { activate } from './activate';
import { deactivate } from './deactivate';
import { updateDetail } from './updateDetail';

const router = {
  activate,
  deactivate,
  updateDetail,
};

export const patch = async (id: string, data: PatchPayload, params: RequestParams<ProductsRepository>) => {
  validateOperation(data.operation, _.keys(router));
  return router[data.operation](id, data.payload, params);
};
