import {
  RequestParams,
  ensurePermission,
  autoFillQuery,
  validateQuery,
} from '@app/core';
import {
  LmsClassRepository,
  lmsClassRepository,
} from '@app/crm';
import _ from 'lodash';
import { PERMISSIONS } from '@common/permissions';

export const find = async (params: RequestParams<LmsClassRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.LMS_CLASSES.VIEW);

  // 2. auto fill then validate query
  const autoFilledQuery = autoFillQuery(params.query);
  validateQuery(autoFilledQuery);

  // 3. query db
  return await lmsClassRepository.find(autoFilledQuery);
};
