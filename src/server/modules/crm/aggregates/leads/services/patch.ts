import _ from 'lodash';
import { PatchPayload, RequestParams, validateOperation } from '@app/core';
import { LeadsRepository } from '@app/crm';
import { updateNewField } from './updateNewField';
import { updateCommentFromLms } from './updateCommentFromLms';
import { sendEmail } from './sendEmail';
import { updateOwner } from './updateOwner';
import { updateStatus } from './updateStatus';
import { updateCentre } from './updateCentre';
import { updateDetail } from './updateDetail';
import { makeFamilyMemberCustomer } from './makeFamilyMemberCustomer';

const router = {
  updateDetail,
  updateNewField,
  updateCommentFromLms,
  sendEmail,
  updateOwner,
  updateStatus,
  updateCentre,
  makeFamilyMemberCustomer,
};

export const patch = async (id: string, data: PatchPayload, params: RequestParams<LeadsRepository>): Promise<object> => {
  validateOperation(data.operation, _.keys(router));
  return router[data.operation](id, data.payload, params);
};
