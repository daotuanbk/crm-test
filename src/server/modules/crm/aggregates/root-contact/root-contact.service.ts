import { RootContactInputError, EntityNotFoundError, validateQuery, ensurePermission, validatePayload, validateOperation } from '@app/core';
import { RootContactService, rootContactRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';

// @ts-ignore
const rootContactService: RootContactService = {
  setup: (app, path) => {
    app.post(path + '/update-email-and-phone', async (req: any, res: any) => {
      try {
        await rootContactRepository.updateEmailAndPhone();
        res.status(200).end();
      } catch (error) {
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
  },
  find: async ({ query, repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.DEFAULT_TASKS.VIEW);

    // 2. validate
    validateQuery(query);

    // 3. do business logic

    // 4. persist to db
    return await repository.find(query);
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.DEFAULT_TASKS.VIEW);

    // 2. validate
    if (!_id) {
      throw new RootContactInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.CONTACTS.CREATE);

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
    validateOperation(data.operation, ['updateDetail', 'syncLms', 'manualSynchronize', 'mergeRootContacts']);
    await rootContactService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.CONTACTS.EDIT);

    // 2. validate
    if (!_id) {
      throw new RootContactInputError(params.translate('missingId'));
    }
    const existedRootContact: any = await params.repository.findById(_id);
    if (!existedRootContact) {
      throw new EntityNotFoundError('RootContact');
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
  manualSynchronize: async (_id, data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.CONTACTS.EDIT);

    // 2. validate
    if (!_id) {
      throw new RootContactInputError(params.translate('missingId'));
    }
    const existedRootContact: any = await params.repository.findById(_id);
    if (!existedRootContact) {
      throw new EntityNotFoundError('RootContact');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);
    // 3. do business logic

    // 4. persist to db
    await params.repository.manualSynchronize(_id, {
      _id,
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },

  mergeRootContacts: async (_id, data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.CONTACTS.EDIT);

    // 2. validate
    if (!_id) {
      throw new RootContactInputError(params.translate('missingId'));
    }
    const existedRootContact: any = await params.repository.findById(_id);
    if (!existedRootContact) {
      throw new EntityNotFoundError('RootContact');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);
    // 3. do business logic

    // 4. persist to db
    await params.repository.mergeRootContacts({
      _id,
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },
};

export default rootContactService;
