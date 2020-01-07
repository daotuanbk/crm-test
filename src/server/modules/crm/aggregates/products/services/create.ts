import { ProductsRepository, ProductCategories, ProductLines, ProductTypes, CreateProductPayload, productsRepository, lmsCourseRepository } from '@app/crm';
import { RequestParams, ensurePermission, validatePayload, removeEmpty } from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';

export const create: any = async (data: CreateProductPayload, params: RequestParams<ProductsRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.PRODUCTS.CREATE);

  // 2. validate
  const inputData = removeEmpty(data);
  await validatePayload({
    name: yup.string().required('Product name must be specified'),
    code: yup.string().required('Product code must be specified'),
    price: yup.number().required('Product price must be specified')
      .min(1000, 'Invalid price (>= 1000 VND)'),
    category: yup.string().required('Category must be specifeid')
      .oneOf([ProductCategories.Kids, ProductCategories.Teens, ProductCategories.Over18], 'Invalid product category'),
    productLine: yup.string().nullable(true)
      .oneOf([
        ProductLines.App,
        ProductLines.C4E,
        ProductLines.Data,
        ProductLines.Game,
        ProductLines.Other,
        ProductLines.Web,
      ], 'Invalid product line'),
    type: yup.string().required('Product type must be specified')
      .oneOf([ProductTypes.Combo, ProductTypes.Single, ProductTypes.Special], 'Invalid product type'),
    course: yup.string()
      .when('type', {
        is: (type) => type === ProductTypes.Single,
        then: yup.string()
          .required('Product course must be specified')
          .test('Existed course', 'Course not found', async (value) => {
            const existedCourse = await lmsCourseRepository.findById(value);
            return !!existedCourse;
          }),
      }),
    maxCourses: yup.number()
      .when('type', {
        is: (type) => type === ProductTypes.Combo,
        then: yup.number()
          .required('Number of course in combo must be specified')
          .min(0, 'Invalid max number of courses (> 0)'),
      }),
    maxDuration: yup.number()
      .when('type', {
        is: (type) => type === ProductTypes.Special,
        then: yup.number()
          .required('Duration must be specified')
          .min(0, 'Invalid max number of duration (> 0)'),
      }),
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
    isActive: yup.bool().nullable(true),
  }, inputData);

  // 3. save to db
  const newProductInfo = {
    ...inputData,
    ...params.creationInfo,
    single: inputData.type === ProductTypes.Single ? {course: inputData.course} : {},
    combo: inputData.type === ProductTypes.Combo ? {
      maxCourses: inputData.maxCourses,
      selectableCourses: inputData.selectableCourses,
    } : {},
    hasCombo: Boolean(inputData.type === ProductTypes.Combo),
    special: inputData.type === ProductTypes.Special ? {
      maxDuration: inputData.maxDuration,
      selectableCourses: inputData.selectableCourses,
    } : {},
    hasSpecial: Boolean(inputData.type === ProductTypes.Special),
  };
  return await productsRepository.create(newProductInfo);
};
