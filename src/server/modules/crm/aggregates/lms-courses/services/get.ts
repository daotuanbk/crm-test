import { RequestParams, ensurePermission } from '@app/core';
import { LmsCourseRepository, lmsCourseRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import { BadRequest } from '@feathersjs/errors';

export const get = async (id: string, params: RequestParams<LmsCourseRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.LMS_COURSES.VIEW);

  // 2. validate
  if (!id) {
    throw new BadRequest('Product ID must be specified');
  }

  // 3. query db
  return await lmsCourseRepository.findById(id);
};
