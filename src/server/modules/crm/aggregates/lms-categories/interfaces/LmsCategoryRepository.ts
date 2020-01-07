import { Repository } from '@app/core';
import { LmsCategory } from '@app/crm';

export interface LmsCategoryRepository extends Repository<LmsCategory> {
  findById: (id: string) => Promise<LmsCategory>;
  findAll: (query: any) => Promise<[LmsCategory]>;
  upsert: (record: LmsCategory) => Promise<LmsCategory | null>;
}
