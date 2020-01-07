import { FindQuery } from '@app/core';
import { ProductTypes, ProductCategories, ProductLines } from '@app/crm';

export interface FindProductsQuery extends FindQuery {
  search?: string;
  type?: ProductTypes[];
  category?: ProductCategories[];
  productLine?: ProductLines[];
  isActive?: boolean;
  limit?: number;
  page?: number;
}
