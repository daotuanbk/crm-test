import { ClassInputError, EntityNotFoundError, validateQuery, ensurePermission, validatePayload, validateOperation } from '@app/core';
import { ClassService, classRepository } from '@app/crm';
import { userRepository } from '@app/auth';
import * as yup from 'yup';
import { PERMISSIONS } from '@common/permissions';
// import { Response } from 'express';
// import { classRepository } from './class.repository';

// @ts-ignore
const classService: ClassService = {
  setup: (app, path) => {
    app.get(path + '/get-all-class', async (req: any, res: any) => {
      try {
        const classes = await classRepository.findAll();
        res.status(200).json({
          data: classes,
        });
      } catch (error) {
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
    app.get(path + '/sync', async (req: any, res: any) => {
      try {
        await classService.synchronize();
        const classes = await classRepository.findAll();
        res.status(200).json({
          data: classes,
        });
      } catch (error) {
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
  },
  find: async ({ query, repository, authUser }) => {
    if (!query.operation) {
      // 1. authorize
      ensurePermission(authUser, PERMISSIONS.CLASS.VIEW);

      if (authUser && authUser.permissions && authUser.permissions.indexOf(PERMISSIONS.CLASS.VIEW_CENTER) >= 0) {
        const currentUser = await userRepository.findById(authUser.id) as any;
        if (currentUser) {
          (authUser as any).centreId = currentUser.centreId;
        }
        return await repository.find({
          ...query,
          authUser,
          viewCentre: true,
        });
      }
      else {
        // 2. validate
        validateQuery(query);

        // 3. do business logic

        // 4. persist to db
        return await repository.find({
          ...query,
          authUser,
        });
      }
    } else {
      validateOperation(query.operation, ['getAllRecords']);
      return await classService[query.operation]({ repository, authUser });
    }
  },
  getAllRecords: async ({ repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.CLASS.VIEW);

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
    ensurePermission(params.authUser, PERMISSIONS.CLASS.VIEW);

    // 2. validate
    if (!_id) {
      throw new ClassInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.CLASS.CREATE);

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
    await classService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.CLASS.EDIT);

    // 2. validate
    if (!_id) {
      throw new ClassInputError(params.translate('missingId'));
    }
    const existedClass: any = await params.repository.findById(_id);
    if (!existedClass) {
      throw new EntityNotFoundError('Class');
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
  synchronize: async () => {
    await classRepository.synchronize();
  },
};

export default classService;
