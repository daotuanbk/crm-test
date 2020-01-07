import {
  CentreInputError,
  EntityNotFoundError,
  validateQuery,
  ensurePermission,
  validatePayload,
  validateOperation,
  logger,
  LEAD_STAGE_STATUS,
} from '@app/core';
import { SystemConfigService, systemConfigRepository, leadRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import { Request, Response } from 'express';
import moment from 'moment';

// @ts-ignore
const systemConfigService: SystemConfigService = {
  setup: (_app, _path) => {
    _app.get(_path + '/lead-stage-status/:stageId', async (req: Request, res: Response) => {
      try {
        const { stageId } = req.params;
        const stageStatuses = await systemConfigRepository.findLeadStageStatusByStageId(stageId);
        res.status(200).json({
          data: stageStatuses,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
    _app.get(_path + '/lead-stage-status', async (_req: Request, res: Response) => {
      try {
        const stageStatuses = await systemConfigRepository.findLeadStageStatus();
        res.status(200).json({
          data: stageStatuses,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
    _app.get(_path + '/lead-stage/', async (_req: Request, res: Response) => {
      try {
        const stageStatuses = await systemConfigRepository.findLeadStages();
        res.status(200).json({
          data: stageStatuses,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
    _app.get(_path + '/lead-class-stage-status', async (_req: Request, res: Response) => {
      try {
        const stageStatuses = await systemConfigRepository.findLeadClassStageStatus();
        res.status(200).json({
          data: stageStatuses,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
    _app.get(_path + '/lead-class-stage/', async (_req: Request, res: Response) => {
      try {
        const stageStatuses = await systemConfigRepository.findLeadClassStages();
        res.status(200).json({
          data: stageStatuses,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
    _app.get(_path + '/prospecting-source/', async (_req: Request, res: Response) => {
      try {
        const stageStatuses = await systemConfigRepository.findProspectingSources();
        res.status(200).json({
          data: stageStatuses,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
    _app.get(_path + '/lead-stage-by-name', async (req: Request, res: Response) => {
      try {
        const data = await systemConfigRepository.findLeadStageByName(req.query.name);
        res.status(200).json({
          data,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
    _app.get(_path + '/lead-stage-by-name', async (req: Request, res: Response) => {
      try {
        const data = await systemConfigRepository.findLeadStageByName(req.query.name);
        res.status(200).json({
          data,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
    _app.get(_path + '/lead-status-by-name', async (req: Request, res: Response) => {
      try {
        const data = await systemConfigRepository.findLeadStatusByName(req.query.name);
        res.status(200).json({
          data,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
    _app.get(_path + '/contact-stage-by-name', async (req: Request, res: Response) => {
      try {
        const data = await systemConfigRepository.findContactStageByName(req.query.name);
        res.status(200).json({
          data,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
    _app.get(_path + '/contact-status-by-name', async (req: Request, res: Response) => {
      try {
        const data = await systemConfigRepository.findContactStatusByName(req.query.name);
        res.status(200).json({
          data,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
    _app.get(_path + '/class-stage-by-name', async (req: Request, res: Response) => {
      try {
        const data = await systemConfigRepository.findClassStageByName(req.query.name);
        res.status(200).json({
          data,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
    _app.get(_path + '/class-status-by-name', async (req: Request, res: Response) => {
      try {
        const data = await systemConfigRepository.findClassStatusByName(req.query.name);
        res.status(200).json({
          data,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });
  },
  find: async ({ query, repository, authUser }) => {
    if (!query.operation) {
      // 1. authorize
      ensurePermission(authUser, PERMISSIONS.SYSTEM_CONFIGS.VIEW);

      // 2. validate
      validateQuery(query);

      // 3. do business logic

      // 4. persist to db
      return await repository.find(query);
    } else {
      validateOperation(query.operation, ['getAllStages', 'getAllStatuses', 'getAllClassStages', 'getAllClassStatus', 'getAllContactStages', 'getAllContactStatuses']);
      return await systemConfigService[query.operation]({ repository, authUser });
    }
  },
  getAllStages: async ({ repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.SYSTEM_CONFIGS.VIEW);

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    const data = await repository.findLeadStages();
    return await {
      data,
    };
  },
  getAllStatuses: async ({ repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.SYSTEM_CONFIGS.VIEW);

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    const data = await repository.findLeadStageStatus();
    return await {
      data,
    };
  },
  getAllClassStages: async ({ repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.SYSTEM_CONFIGS.VIEW);

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    const data = await repository.findLeadClassStages();
    return await {
      data,
    };
  },
  getAllClassStatus: async ({ repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.SYSTEM_CONFIGS.VIEW);

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    const data = await repository.findLeadClassStageStatus();
    return await {
      data,
    };
  },
  getAllContactStages: async ({ repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.SYSTEM_CONFIGS.VIEW);

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    const data = await repository.findLeadContactStages();
    return await {
      data,
    };
  },
  getAllContactStatuses: async ({ repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.SYSTEM_CONFIGS.VIEW);

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    const data = await repository.findLeadContactStatuses();
    return await {
      data,
    };
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.SYSTEM_CONFIGS.VIEW);

    // 2. validate
    if (!_id) {
      throw new CentreInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.SYSTEM_CONFIGS.CREATE);

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
    await systemConfigService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.SYSTEM_CONFIGS.EDIT);

    // 2. validate
    if (!_id) {
      throw new CentreInputError(params.translate('missingId'));
    }
    const existedCentre: any = await params.repository.findById(_id);
    if (!existedCentre) {
      throw new EntityNotFoundError('Centre');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);

    // 3. do business logic
    if (data && data.option === LEAD_STAGE_STATUS) {
      if (data.value && data.value.name && data.value.overdue) {
        const leads = await leadRepository.findByCriteria({ currentStatus: status });
        const updatePromises: any[] = [];

        leads.forEach((lead: any) => {
          if (lead && data.value.overdue) {
            let overdueStatusAt = lead.overdueStatusAt;
            if (lead.lastUpdatedStageAt) {
              overdueStatusAt = moment(lead.lastUpdatedStatusAt).add(Number(data.value.overdue), 'days').valueOf();
            }

            updatePromises.push(leadRepository.update({
              id: lead._id,
              overdueStatusAt,
            } as any));
          }
        });
        await Promise.all(updatePromises);
      }
    }

    // 4. persist to db
    await params.repository.update({
      id: _id,
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },
};

export default systemConfigService;
