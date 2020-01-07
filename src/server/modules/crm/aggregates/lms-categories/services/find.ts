import { RequestParams, ensurePermission, autoFillQuery, validateQuery } from '@app/core';
import {
  lmsCategoryRepository,
  LmsCategoryRepository,
} from '@app/crm';
import _ from 'lodash';
import { PERMISSIONS } from '@common/permissions';

export const find = async (params: RequestParams<LmsCategoryRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.LMS_CATEGORIES.VIEW);

  // 2. auto fill then validate query
  const autoFilledQuery = autoFillQuery(params.query);
  validateQuery(autoFilledQuery);

  // 3. query db
  return await lmsCategoryRepository.find(autoFilledQuery);
};
