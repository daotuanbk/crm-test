import { Repository, FindResult } from '@app/core';
import { ProductCombo, FindProductComboQuery } from '@app/crm';

export interface ProductComboRepository extends Repository<ProductCombo> {
  find: (query: FindProductComboQuery) => Promise<FindResult<ProductCombo>>;
  findAll: () => Promise<ProductCombo[]>;
  init: () => Promise<any>;
}
