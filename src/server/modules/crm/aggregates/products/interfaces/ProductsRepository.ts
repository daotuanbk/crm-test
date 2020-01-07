import { Repository, FindResult } from '@app/core';
import { Product, FindProductsQuery } from '@app/crm';

export interface ProductsRepository extends Repository<Product> {
  find: (query: FindProductsQuery) => Promise<FindResult<Product>>;
}
