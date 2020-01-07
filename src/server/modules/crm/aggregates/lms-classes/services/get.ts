import {
  RequestParams,
  ensurePermission,
} from '@app/core';
import {
  LmsClassRepository,
  lmsClassRepository,
} from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import { BadRequest } from '@feathersjs/errors';

export const get = async (id: string, params: RequestParams<LmsClassRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.LMS_CLASSES.VIEW);

  // 2. validate
  if (!id) {
    throw new BadRequest('Product ID must be specified');
  }

  // 3. query db
  return await lmsClassRepository.findById(id);
};
