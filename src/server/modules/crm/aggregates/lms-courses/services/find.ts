import { RequestParams, ensurePermission, autoFillQuery, validateQuery } from '@app/core';
import {
  LmsCourseRepository,
  lmsCourseRepository,
} from '@app/crm';
import _ from 'lodash';
import { PERMISSIONS } from '@common/permissions';

export const find = async (params: RequestParams<LmsCourseRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.LMS_COURSES.VIEW);

  // 2. auto fill then validate query
  const autoFilledQuery = autoFillQuery(params.query);
  validateQuery(autoFilledQuery);

  // 3. query db
  return await lmsCourseRepository.find(autoFilledQuery);

  // const dataWithCategories = await Promise.all(result.data.map((course: LmsCourse) => {
  //   return (async () => {
  //     return {
  //       ...course,
  //       categories: await lmsCategoryRepository.findAll({
  //         courses: course._id,
  //       }),
  //     };
  //   })();
  // }));

  // return {
  //   ...result,
  //   data: dataWithCategories,
  // };
};
