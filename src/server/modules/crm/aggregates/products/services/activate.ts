import { RequestParams, ensurePermission, validatePayload } from '@app/core';
import { ProductsRepository, productsRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';

export const activate = async (id: string, _data: any, params: RequestParams<ProductsRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.PRODUCTS.EDIT);

  // 2. validate
  await validatePayload({
    id: yup.string().required('Product ID must be specified')
      .test('Existed product', 'Product not found', async (value: string) => {
        const existedProduct = await productsRepository.findById(value);
        return !!existedProduct;
      }),
  }, {
    id,
  });

  // 3. update db
  return await productsRepository.update({
    id,
    isActive: true,
    ...params.modificationInfo,
  });
};
