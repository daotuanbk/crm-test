import {
  CampaignInputError,
  EntityNotFoundError,
  validateQuery,
  ensurePermission,
  validatePayload,
  validateOperation,
} from '@app/core';
import { CampaignService } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
// import { Response } from 'express';
// import { centreRepository } from './centre.repository';

// @ts-ignore
const campaignService: CampaignService = {
  setup: (_app, _path) => {
    //
  },
  find: async ({ query, repository, authUser }) => {
    validateOperation(query.operation || 'getAll', ['getAll', 'getAllRecord']);

    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.CAMPAIGNS.VIEW);

    return await campaignService[query.operation || 'getAll']({query, repository});
  },
  getAllRecord: async ({repository}) => {
    return await repository.findAll();
  },
  getAll: async ({query, repository}) => {
    // 1. validate
    validateQuery(query);

    // 2. persist to db
    return await repository.find(query);
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.CAMPAIGNS.VIEW);

    // 2. validate
    if (!_id) {
      throw new CampaignInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.CAMPAIGNS.CREATE);

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
    await campaignService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.CAMPAIGNS.EDIT);

    // 2. validate
    if (!_id) {
      throw new CampaignInputError(params.translate('missingId'));
    }
    const existedCampaign: any = await params.repository.findById(_id);
    if (!existedCampaign) {
      throw new EntityNotFoundError('Campaign');
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
  remove: async (id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.CAMPAIGNS.DELETE);

    // 2. validate
    if (!id) {
      throw new CampaignInputError(params.translate('missingId'));
    }
    const existed: any = await params.repository.findById(id);
    if (!existed) {
      throw new EntityNotFoundError('Campaign');
    }

    // 3. persist to db
    await params.repository.del(id);
    return {};
  },
};

export default campaignService;
