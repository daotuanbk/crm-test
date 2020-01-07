import { Service } from '@app/core';
import { Product, FindProductsQuery, ProductsRepository } from '@app/crm';

export interface ProductsService extends Service<Product, FindProductsQuery, ProductsRepository> {}
