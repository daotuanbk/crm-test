import { ListInputError, EntityNotFoundError, validateQuery, ensurePermission, validatePayload, validateOperation } from '@app/core';
import { ListsService } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
// import { Response } from 'express';
// import { listRepository } from './lists.repository';

const listsService: ListsService = {
  setup: (_app, _path) => {
    //
  },
  find: async ({ query, repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.LISTS.VIEW);

    // 2. validate
    validateQuery(query);

    // 3. do business logic

    // 4. persist to db
    return await repository.find(query);
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LISTS.VIEW);

    // 2. validate
    if (!_id) {
      throw new ListInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LISTS.CREATE);

    // 2. validate
    await validatePayload({
      // Validate object
    }, data);

    // 3. do business logic

    // 4. persist to db
    const id = await params.repository.create({
      ...data,
      ...params.creationInfo,
    });

    return {
      id,
    };
  },
  patch: async (id, data, params) => {
    validateOperation(data.operation, ['updateDetail']);
    await listsService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LISTS.EDIT);

    // 2. validate
    if (!_id) {
      throw new ListInputError(params.translate('missingId'));
    }
    const existedList: any = await params.repository.findById(_id);
    if (!existedList) {
      throw new EntityNotFoundError('List');
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
    return {};
  },
};

export default listsService;
