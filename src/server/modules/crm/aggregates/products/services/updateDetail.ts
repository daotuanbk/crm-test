import { RequestParams, ensurePermission, removeEmpty, validatePayload } from '@app/core';
import { ProductsRepository, UpdateProductPayload, productsRepository, ProductTypes, lmsCourseRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';

export const updateDetail = async (id: string, data: UpdateProductPayload, params: RequestParams<ProductsRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.PRODUCTS.CREATE);

  // 2. validate
  const inputData = removeEmpty(data);
  let existedProduct: any;
  await validatePayload({
    id: yup.string().required('Product ID must be specified')
      .test('Existed product', 'Product not found', async (value: string) => {
        existedProduct = await productsRepository.findById(value);
        return !!existedProduct;
      }),
    price: yup.number().nullable(true)
      .min(1000, 'Invalid price (>= 1000 VND)'),
    isActive: yup.bool().nullable(true),
    selectableCourses: yup.array().nullable(true)
      .when('type', {
        is: (type) => type === ProductTypes.Special || type === ProductTypes.Combo,
        then: yup.array()
          .required('Selectable courses must be specified')
          .test('Min length', 'Invalid selectable courses (> 0)', (value: string[]) => {
            return value.length > 0;
          })
          .test('Existed courses', 'Course not found', async (value: string[]) => {
            for (const lmsCourseId of value) {
              const existedCourse = await lmsCourseRepository.findById(lmsCourseId);
              if (!existedCourse) {
                return false;
              }
            }
            return true;
          }),
      }),
  }, {
    id,
    ...inputData,
  });

  // 3. save to db
  const newProductInfo = {
    id,
    ...inputData,
    ...params.modificationInfo,
    combo: existedProduct.type === ProductTypes.Combo ? {
      maxCourses: existedProduct.combo.maxCourses,
      selectableCourses: inputData.selectableCourses,
    } : {},
    special: existedProduct.type === ProductTypes.Special ? {
      maxDuration: existedProduct.special.maxDuration,
      selectableCourses: inputData.selectableCourses,
    } : {},
  };
  return await productsRepository.update(newProductInfo);
};
