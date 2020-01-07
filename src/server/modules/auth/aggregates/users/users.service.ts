import {
  UserInputError,
  EntityNotFoundError,
  ensurePermission,
  validatePayload,
  validateOperation,
  logger,
 } from '@app/core';
import { UsersService, addFullName } from '@app/auth';
import roleService from '../roles/roles.service';
import * as yup from 'yup';
import admin from 'firebase-admin';
import { Response } from 'express';
import { userRepository } from './users.repository';
import cache from 'memory-cache';
import { PERMISSIONS } from '@common/permissions';
import { find } from './services';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
const usersService: UsersService = {
  setup: (app, path) => {
    app.get(path + '/check-email-exist/:email', async (req: any, res: Response) => {
      try {
        const { email } = req.params;
        const existedEmail = await userRepository.findOne({email});
        res.status(200).json({
          emailExist: Boolean(existedEmail),
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });

    app.get(path + '/get-all-users', async (req: any, res: Response) => {
      try {
        const result = await userRepository.findAll(req.query);
        res.status(200).json(result);
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });

    app.get(path + '/get-salesman', async (req: any, res: Response) => {
      try {
        const salesmanRole = await roleService.findSalesman();
        const result = await userRepository.findSalesman(salesmanRole.map((salesman: any) => salesman._id || salesman.id));
        res.status(200).json({
          data: result,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
    app.get(path + '/get-interviewer', async (req: any, res: Response) => {
      try {
        const interviewerRole = await roleService.findInterviewer();
        const result = await userRepository.findSalesman(interviewerRole.map((interviewer: any) => interviewer._id || interviewer.id));
        res.status(200).json({
          data: result,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
    app.get(path + '/get-salesman/:centreId', async (req: any, res: Response) => {
      try {
        const salesmanRole = await roleService.findSalesman();
        const {centreId} = req.params;
        const result = await userRepository.findSalesmanByCentreId(salesmanRole.map((salesman: any) => salesman._id || salesman.id), centreId);
        res.status(200).json({
          data: result,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
    app.get(path + '/get-permissions/:id', async (req: any, res: Response) => {
      try {
        const { permissions } = await userRepository.getAuthUser(req.params.id);
        res.status(200).json({
          data: permissions,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
  },
  find,
  get: async (id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.USERS.VIEW);

    // 2. validate
    if (!id) {
      throw new UserInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.USERS.CREATE);

    // 2. validate
    await validatePayload({
      email: yup.string().email(params.translate('invalidEmail')).required(params.translate('emailRequired')),
      password: yup.string()
      .matches(passwordRegex, params.translate('invalidPasswordRegex'))
      .required(params.translate('passwordRequired')),
      roles: yup.array(),
      familyName: yup.string()
      .required(params.translate('familyNameRequired'))
      .min(2, params.translate('tooShort'))
      .max(50, params.translate('tooLong')),
      givenName: yup.string()
      .required(params.translate('givenNameRequired'))
      .min(2, params.translate('tooShort'))
      .max(50, params.translate('tooLong')),
    }, data);
    const existedUser = await params.repository.findOne({email: data.email});
    if (existedUser) {
      throw new UserInputError(params.translate('emailExist'));
    }

    // 3. do business logic
    const newUser = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      emailVerified: true,
    });

    await admin.auth().setCustomUserClaims(newUser.uid, {
      roles: data.roles,
      avatarUrl: '',
    });

    // 4. persist to db
    const id = await params.repository.create({
      id: newUser.uid,
      ...data,
      ...params.creationInfo,
      loginDetail: {
        email: data.email,
        provider: 'email',
      },
      fullName: addFullName({ familyName: data.familyName!, givenName: data.givenName!, type: 'givenNameFirst' }),
    });

    return {
      id,
    };
  },
  patch: async (id, data, params) => {
    validateOperation(data.operation, ['updateDetail', 'activate', 'deactivate']);
    await usersService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.USERS.EDIT);

    // 2. validate
    if (!id) {
      throw new UserInputError(params.translate('missingId'));
    }
    const existedUser: any = await params.repository.findById(id);
    if (!existedUser) {
      throw new EntityNotFoundError('User');
    }
    const validationSchema = yup.object().shape({
      email: yup.string().email(params.translate('invalidEmail')),
      familyName: yup.string()
      .min(2, params.translate('tooShort'))
      .max(50, params.translate('tooLong')),
      givenName: yup.string()
      .min(2, params.translate('tooShort'))
      .max(50, params.translate('tooLong')),
      roles: yup.array(),
    });
    await validationSchema.validate(data);
    if (data.email) {
      const emailExist = await params.repository.findOne({email: data.email});
      if (emailExist && emailExist.id !== id) {
        throw new UserInputError(params.translate('emailExist'));
      }
    }

    // 3. do business logic
    if (data.email) {
      await admin.auth().updateUser(existedUser._id, {
        email: data.email,
      });
    }
    if (data.password) {
      await admin.auth().updateUser(existedUser._id, {
        password: data.password,
      });
    }
    if (data.roles && data.roles.length > 0) {
      admin.auth().setCustomUserClaims(existedUser._id, {
        roles: data.roles,
      });
    }
    cache.del('PERMISSIONS_' + id);
    if (data.familyName || data.givenName) {
      admin.auth().updateUser(existedUser._id, {
        displayName: addFullName({ familyName: data.familyName || existedUser.familyName, givenName: data.givenName || existedUser.givenName, type: 'givenNameFirst' }),
      });
    }

    // 4. persist to db
    await params.repository.update({
      id,
      ...data,
      ...params.modificationInfo,
      fullName: addFullName({ familyName: data.familyName || existedUser.familyName, givenName: data.givenName || existedUser.givenName, type: 'givenNameFirst' }),
    });
    return {};
  },
  activate: async (id, _data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.USERS.EDIT);

    // 2. validate
    if (!id) {
      throw new UserInputError(params.translate('missingId'));
    }
    const existedUser = await params.repository.findById(id);
    if (!existedUser) {
      throw new EntityNotFoundError('User');
    }

    // 3. do business logic
    admin.auth().updateUser(existedUser.id, {
      emailVerified: true,
    });

    // 4. persist to db
    await params.repository.update({
      id,
      isActive: true,
      ...params.modificationInfo,
    });

    return {};
  },
  deactivate: async (id, _data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.USERS.EDIT);

    // 2. validate
    if (!id) {
      throw new UserInputError(params.translate('missingId'));
    }
    const existedUser = await params.repository.findById(id);
    if (!existedUser) {
      throw new EntityNotFoundError('User');
    }

    // 3. do business logic
    admin.auth().updateUser(existedUser.id, {
      emailVerified: false,
    });

    // 4. persist to db
    await params.repository.update({
      id,
      isActive: false,
      ...params.modificationInfo,
    });

    return {};
  },
  getAuthUser: async (id) => {
    return await userRepository.getAuthUser(id);
  },
};

export default usersService;
