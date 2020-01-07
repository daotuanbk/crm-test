import { Repository, FindResult } from '@app/core';
import { LmsCourse, FindLmsCourseQuery } from '@app/crm';

export interface LmsCourseRepository extends Repository<LmsCourse> {
  find: (query: FindLmsCourseQuery) => Promise<FindResult<LmsCourse>>;
  findById: (id: string) => Promise<LmsCourse>;
  delByCriteria: (query: any) => Promise<void>;
  upsert: (record: LmsCourse) => Promise<LmsCourse | null>;
  pushCategoryIfNeeded: (includeIds: [string], categoryId: string) => Promise<void>;
  popCategoryIfNeeded: (exludeIds: [string], categoryId: string) => Promise<void>;
}
