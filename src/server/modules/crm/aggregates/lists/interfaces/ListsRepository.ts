import { Repository, FindResult } from '@app/core';
import { List, FindListsQuery } from '@app/crm';

export interface ListsRepository extends Repository<List> {
  find: (query: FindListsQuery) => Promise<FindResult<List>>;
}
