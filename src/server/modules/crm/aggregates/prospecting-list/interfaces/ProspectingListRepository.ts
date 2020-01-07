import { Repository, FindResult } from '@app/core';
import { ProspectingList, FindProspectingListQuery } from '@app/crm';

export interface ProspectingListRepository extends Repository<ProspectingList> {
  find: (query: FindProspectingListQuery, isPriority?: boolean) => Promise<FindResult<ProspectingList>>;
  findAll: () => Promise<any>;
  init: () => Promise<any>;
  increaseEntries: (criteria: any, payload: any) => Promise<any>;
  findBySource: (source: number) => Promise<any>;
  findByQuery: (query: any) => Promise<any>;
  addToSubAssignees: (id: string, sub: string) => Promise<void>;
}
