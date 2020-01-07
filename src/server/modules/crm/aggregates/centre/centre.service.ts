import {
  CentreInputError,
  EntityNotFoundError,
  ensurePermission,
  validatePayload,
  validateOperation,
} from '@app/core';
import { CentreService, centreRepository } from '@app/crm';
import { config } from '@app/config';
import * as yup from 'yup';
import axios from 'axios';
import { PERMISSIONS } from '@common/permissions';

import { find, getAllRecords } from './services';
// import { Response } from 'express';
// import { centreRepository } from './centre.repository';

// @ts-ignore
const centreService: CentreService = {
  setup: (app, path) => {
    app.get(path + '/get-all-centre', async (req: any, res: any) => {
      try {
        const centres = await centreRepository.findAll();
        res.status(200).json({
          data: centres,
        });
      } catch (error) {
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
    app.get(path + '/sync', async (req: any, res: any) => {
      try {
        await centreService.synchronize();
        const centres = await centreRepository.findAll();
        res.status(200).json({
          data: centres,
        });
      } catch (error) {
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
  },
  find,
  getAllRecords,
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.CENTRES.VIEW);

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
    ensurePermission(params.authUser, PERMISSIONS.CENTRES.CREATE);

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
    await centreService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.CENTRES.EDIT);

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

    // 4. persist to db
    await params.repository.update({
      id: _id,
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },
  synchronize: async () => {
    const centres = await axios({
      method: 'GET',
      url: `${config.lms.url}/centers?_limit=10000`,
    });
    if (centres && centres.data) {
      await centreRepository.synchronize(centres.data);
    }
  },
};

export default centreService;
