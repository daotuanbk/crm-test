import { Repository, FindResult } from '@app/core';
import { Centre, FindCentreQuery } from '@app/crm';

export interface CentreRepository extends Repository<Centre> {
  find: (query: FindCentreQuery) => Promise<FindResult<Centre>>;
  findAll: () => any;
  synchronize: (data: any) => Promise<void>;
}
