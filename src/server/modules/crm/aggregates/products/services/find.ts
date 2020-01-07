import { RequestParams, ensurePermission, autoFillQuery, validateQuery } from '@app/core';
import { ProductsRepository, productsRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';

export const find = async (params: RequestParams<ProductsRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.PRODUCTS.VIEW);

  // 2. auto fill then validate query
  const autoFilledQuery = autoFillQuery(params.query);
  validateQuery(autoFilledQuery);

  // 3. query db
  return await productsRepository.find(autoFilledQuery);
};
