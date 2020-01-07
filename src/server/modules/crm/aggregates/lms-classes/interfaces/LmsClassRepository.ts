import { Repository, FindResult } from '@app/core';
import { LmsClass, FindLmsClassQuery } from '@app/crm';

export interface LmsClassRepository extends Repository<LmsClass> {
  find: (query: FindLmsClassQuery) => Promise<FindResult<LmsClass>>;
  findById: (id: string) => Promise<LmsClass>;
  delByCriteria: (query: any) => Promise<void>;
  upsert: (record: LmsClass) => Promise<LmsClass | null>;
  updateCourse: (id: string, lmsCourse: string) => Promise<LmsClass | null>;
}
