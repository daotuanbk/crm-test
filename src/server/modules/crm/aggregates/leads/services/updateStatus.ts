import * as yup from 'yup';
import _ from 'lodash';
import { validatePayload, ensurePermission } from '@app/core';
import { leadRepository } from '@app/crm';
import { BadRequest } from '@feathersjs/errors';
import { STAGES } from '@common/stages';
import { PERMISSIONS } from '@common/permissions';
import { checkAllowedUpdateStatus } from '../helpers/checkAllowedUpdateStatus';

const statusData = _(STAGES).map((stage: any) => ({
  ...stage,
  statuses: stage.statuses.map((status: any) => ({ ...status, stageShortName: stage.shortName })),
}))
  .flatMap('statuses')
  .mapKeys('shortName')
  .value();

export const updateStatus = async (id: string, data: any, params: any) => {
  // 1. Authorize
  ensurePermission(params.authUser, PERMISSIONS.LEADS.EDIT);

  // 2. Validate payload
  await validatePayload({
    statusName: yup.string()
      .required('"statusName" cant be empty')
      .test('Check statusName exsitence',
        'Status name not valid',
        (value: string) => statusData[value]),
  }, data);

  // 3. Handle bussiness logic
  const { statusName } = data;

  // Check existed Lead
  const lead = await leadRepository.findById(id);
  if (!lead) {
    throw new BadRequest('Lead not found');
  }

  // Check if new status is allowed
  if (!checkAllowedUpdateStatus(lead.v2Status, statusName)) {
    throw new BadRequest(`Status "${lead.v2Status}" is not allowed to update to "${statusName}"`);
  }

  // 4. Persit to db
  return await leadRepository.update({
    id,
    v2Status: statusName,
  });
};
