import { Repository, FindResult } from '@app/core';
import { DefaultTask, FindDetaulTaskQuery } from '@app/crm';

export interface DefaultTaskRepository extends Repository<DefaultTask> {
  find: (query: FindDetaulTaskQuery) => Promise<FindResult<DefaultTask>>;
  findAll: () => Promise<any>;
}
