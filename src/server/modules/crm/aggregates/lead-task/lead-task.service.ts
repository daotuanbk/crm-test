import {
  LeadTaskInputError,
  EntityNotFoundError,
  validateQuery,
  ensurePermission,
  validatePayload,
  validateOperation,
  logger,
} from '@app/core';
import { LeadTaskService, leadTaskRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import { Request, Response } from 'express';

// @ts-ignore
const leadTaskService: LeadTaskService = {
  setup: (_app, _path) => {
    _app.get(_path + '/get-lead-tasks/:leadId', async (req: Request, res: Response) => {
      try {
        const { leadId } = req.params;
        const leadTasks = await leadTaskRepository.findByLeadId(leadId);
        res.status(200).json({
          data: leadTasks,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
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
      throw new LeadTaskInputError(params.translate('missingId'));
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
    await leadTaskService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_TASKS.EDIT);

    // 2. validate
    if (!_id) {
      throw new LeadTaskInputError(params.translate('missingId'));
    }
    const existedLeadTask: any = await params.repository.findById(_id);
    if (!existedLeadTask) {
      throw new EntityNotFoundError('LeadTask');
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
      throw new LeadTaskInputError(params.translate('missingId'));
    }
    const existedLeadTask: any = await params.repository.findById(_id);
    if (!existedLeadTask) {
      throw new EntityNotFoundError('LeadTask');
    }

    // 3. persist to db
    await params.repository.del(_id);
    return {};
  },
};

export default leadTaskService;
