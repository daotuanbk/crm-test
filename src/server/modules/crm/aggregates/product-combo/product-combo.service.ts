import { ProductComboInputError, EntityNotFoundError, validateQuery, ensurePermission, validatePayload, validateOperation } from '@app/core';
import { ProductComboService } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import { productComboRepository } from './product-combo.repository';
// import { Response } from 'express';
// import { productComboRepository } from './productCombo.repository';

const productComboService: ProductComboService = {
  setup: (app, path) => {
    app.get(path + '/get-all-combos', async (req: any, res: any) => {
      try {
        const combos = await productComboRepository.findAll();
        res.status(200).json({
          data: combos,
        });
      } catch (error) {
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
  },
  find: async ({ query, repository, authUser }) => {
    if (!query.operation) {
      // 1. authorize
      ensurePermission(authUser, PERMISSIONS.PRODUCT_COMBOS.VIEW);

      // 2. validate
      validateQuery(query);

      // 3. do business logic

      // 4. persist to db
      return await repository.find(query);
    } else {
      validateOperation(query.operation, ['getAllRecords']);
      return await productComboService[query.operation]({ repository, authUser });
    }
  },
  getAllRecords: async ({ repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.PRODUCT_COMBOS.VIEW);

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
    ensurePermission(params.authUser, PERMISSIONS.PRODUCT_COMBOS.VIEW);

    // 2. validate
    if (!_id) {
      throw new ProductComboInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.PRODUCT_COMBOS.CREATE);

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
    return await productComboService[data.operation](id, data.payload, params);
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.PRODUCT_COMBOS.EDIT);

    // 2. validate
    if (!_id) {
      throw new ProductComboInputError(params.translate('missingId'));
    }
    const existedProductCombo: any = await params.repository.findById(_id);
    if (!existedProductCombo) {
      throw new EntityNotFoundError('ProductCombo');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);

    // 3. do business logic

    // 4. persist to db
    const combo = await params.repository.update({
      id: _id,
      ...data,
      ...params.modificationInfo,
    }) as any;
    return combo;
  },
  remove: async (id, { authUser, repository }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.PRODUCT_COMBOS.DELETE);

    // 2. validate
    const existedLeadFilter = await repository.findById(id);
    if (!existedLeadFilter) {
      throw new EntityNotFoundError('ProductCombo');
    }

    // 3. do business logic

    // 4. persist to db
    await repository.del(id);
    return {};
  },
};

export default productComboService;
