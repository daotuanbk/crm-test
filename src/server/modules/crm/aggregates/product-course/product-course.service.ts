import { ProductCourseInputError, EntityNotFoundError, validateQuery, ensurePermission, validatePayload, validateOperation } from '@app/core';
import { ProductCourseService, leadProductOrderRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import { productCourseRepository } from './product-course.repository';
import axios from 'axios';
import { config } from '@app/config';

const productCourseService: ProductCourseService = {
  setup: (app, path) => {
    app.get(path + '/get-all-courses', async (req: any, res: any) => {
      try {
        const courses = await productCourseRepository.findAll();
        res.status(200).json({
          data: courses,
        });
      } catch (error) {
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
    app.get(path + '/sync', async (req: any, res: any) => {
      try {
        await productCourseService.synchronize();
        const courses = await productCourseRepository.findAll();
        res.status(200).json({
          data: courses,
        });
      } catch (error) {
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
  },
  find: async ({ query, repository, authUser }) => {
    if (!query.operation) {
      // 1. authorize
      ensurePermission(authUser, PERMISSIONS.PRODUCT_COURSES.VIEW);

      // 2. validate
      validateQuery(query);

      // 3. do business logic

      // 4. persist to db
      return await repository.find(query);
    } else {
      validateOperation(query.operation, ['getAllRecords']);
      return await productCourseService[query.operation]({ repository, authUser });
    }
  },
  getAllRecords: async ({ repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.PRODUCT_COURSES.VIEW);

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    const data = await repository.findAll();
    return await {
      data,
    };
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.PRODUCT_COURSES.VIEW);

    // 2. validate
    if (!_id) {
      throw new ProductCourseInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.PRODUCT_COURSES.CREATE);

    // 2. validate
    await validatePayload({
      // Validate object
    }, data);

    // 3. do business logic

    // 4. persist to db
    const _id = await params.repository.create({
      ...data,
      ...params.creationInfo,
    });

    return {
      id: _id,
    };
  },
  patch: async (id, data, params) => {
    validateOperation(data.operation, ['updateDetail']);
    await productCourseService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.PRODUCT_COURSES.EDIT);

    // 2. validate
    if (!_id) {
      throw new ProductCourseInputError(params.translate('missingId'));
    }
    const existedProductCourse: any = await params.repository.findById(_id);
    if (!existedProductCourse) {
      throw new EntityNotFoundError('ProductCourse');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);

    // 3. do business logic

    // 4. persist to db
    await params.repository.update({
      _id,
      ...data,
      ...params.modificationInfo,
    });
    await leadProductOrderRepository.updateCourses(_id, data);
    return {};
  },
  synchronize: async () => {
    const courses = await axios({
      method: 'GET',
      url: `${config.lms.url}/courses?_limit=10000`,
    });
    if (courses && courses.data) {
      const inputs = courses.data.filter((val: any) => val.title && val._id).map((val: any) => {
        return {
          _id: val._id,
          name: val.title,
          description: val.description,
          shortName: val.title,
          order: 1,
          tuitionBeforeDiscount: Number(val.price || val.details && val.details.originPrice) || 5000000,
          isAvailableInCombo: true,
        };
      });
      await productCourseRepository.synchronize(inputs);
    }
  },
};

export default productCourseService;
