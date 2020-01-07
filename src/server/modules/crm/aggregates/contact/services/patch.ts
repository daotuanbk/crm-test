import _ from 'lodash';
import { PatchPayload, RequestParams, validateOperation } from '@app/core';
import { ContactRepository } from '@app/crm';
import { updateDetail } from './updateDetail';
import { addFamilyMember } from './addFamilyMember';

const router = {
  updateDetail,
  addFamilyMember,
};

export const patch = async (id: string, data: PatchPayload, params: RequestParams<ContactRepository>): Promise<object> => {
  validateOperation(data.operation, _.keys(router));
  await router[data.operation](id, data.payload, params);
  return {};
};
