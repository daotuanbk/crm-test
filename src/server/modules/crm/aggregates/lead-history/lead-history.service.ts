import {
  LeadHistoryInputError,
  EntityNotFoundError,
  validateQuery,
  ensurePermission,
  validatePayload,
  validateOperation,
} from '@app/core';
import { LeadHistoryService } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';

// @ts-ignore
const leadHistoryService: LeadHistoryService = {
  setup: (_app, _path) => {
    //
  },
  find: async ({ query, repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.LEAD_TASKS.VIEW);

    // 2. validate
    validateQuery(query);

    // 3. do business logic

    // 4. persist to db
    return await repository.find(query);
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_TASKS.VIEW);

    // 2. validate
    if (!_id) {
      throw new LeadHistoryInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_TASKS.EDIT);

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
      id : _id,
      _id,
    };
  },
  patch: async (id, data, params) => {
    validateOperation(data.operation, ['updateDetail']);
    await leadHistoryService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_TASKS.EDIT);

    // 2. validate
    if (!_id) {
      throw new LeadHistoryInputError(params.translate('missingId'));
    }
    const existedLeadHistory: any = await params.repository.findById(_id);
    if (!existedLeadHistory) {
      throw new EntityNotFoundError('LeadHistory');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);
    // 3. do business logic

    // 4. persist to db
    await params.repository.update({
      id: _id,
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },
  remove: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_TASKS.DELETE);

    // 2. validate
    if (!_id) {
      throw new LeadHistoryInputError(params.translate('missingId'));
    }
    const existedLeadHistory: any = await params.repository.findById(_id);
    if (!existedLeadHistory) {
      throw new EntityNotFoundError('LeadHistory');
    }

    // 3. persist to db
    await params.repository.del(_id);
    return {};
  },
};

export default leadHistoryService;
