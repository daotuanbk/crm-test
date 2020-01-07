import { Service } from '@app/core';
import { LmsCourse, FindLmsCourseQuery, LmsCourseRepository } from '@app/crm';

export interface LmsCourseService extends Service<LmsCourse, FindLmsCourseQuery, LmsCourseRepository> {}
