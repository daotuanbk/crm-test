import { Repository, FindResult } from '@app/core';
import { Class, FindClassQuery } from '@app/crm';

export interface ClassRepository extends Repository<Class> {
  find: (query: FindClassQuery) => Promise<FindResult<Class>>;
  findAll: () => any;
  synchronize: () => Promise<void>;
  findAndPopulate: (id: string) => Promise<any>;
}
