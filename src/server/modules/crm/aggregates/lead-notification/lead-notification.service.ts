import {
  LeadNotificationInputError,
  EntityNotFoundError,
  validateQuery,
  ensurePermission,
  validatePayload,
  validateOperation,
} from '@app/core';
import { LeadNotificationService } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import { ObjectId } from 'mongodb';

// @ts-ignore
const leadNotificationService: LeadNotificationService = {
  setup: (_app, _path) => {
    //
  },
  find: async ({ query, repository, authUser }) => {
    if (!query.operation) {
      // 1. authorize
      ensurePermission(authUser, PERMISSIONS.LEAD_NOTIFICATIONS.VIEW);

      // 2. validate
      validateQuery(query);

      // 3. do business logic

      // 4. persist to db
      return await repository.find(query);
    } else {
      validateOperation(query.operation, ['countUnseen']);
      return await leadNotificationService[query.operation]({ repository, authUser, query });
    }
  },
  countUnseen: async ({ repository, authUser, query }) => {
    ensurePermission(authUser, PERMISSIONS.LEAD_NOTIFICATIONS.VIEW);
    return await repository.countUnseen(query);
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_NOTIFICATIONS.VIEW);

    // 2. validate
    if (!_id) {
      throw new LeadNotificationInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_NOTIFICATIONS.CREATE);

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
    validateOperation(data.operation, ['updateDetail', 'check', 'seen', 'markAllAsSeen']);
    await leadNotificationService[data.operation](id, data.payload, params);
    return {};
  },
  seen: async (_id, data, params) => {
    ensurePermission(params.authUser, PERMISSIONS.LEAD_NOTIFICATIONS.EDIT);
    const {ids} = data as any;
    return await params.repository.seen({
      _id: {
        $in: ids.map((id: string) => new ObjectId(id)),
      },
    });
  },
  markAllAsSeen: async (_id, data, params) => {
    ensurePermission(params.authUser, PERMISSIONS.LEAD_NOTIFICATIONS.EDIT);
    const {ownerId} = data as any;
    return await params.repository.seen({ownerId});
  },
  check: async (id, _data, params) => {
    ensurePermission(params.authUser, PERMISSIONS.LEAD_NOTIFICATIONS.EDIT);
    return await params.repository.check(id);
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_NOTIFICATIONS.EDIT);

    // 2. validate
    if (!_id) {
      throw new LeadNotificationInputError(params.translate('missingId'));
    }
    const existedLeadNotification: any = await params.repository.findById(_id);
    if (!existedLeadNotification) {
      throw new EntityNotFoundError('LeadNotification');
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
};

export default leadNotificationService;
