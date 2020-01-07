import { EmailTemplateConfigInputError, EntityNotFoundError, validateQuery, ensurePermission, validatePayload, validateOperation } from '@app/core';
import { EmailTemplateConfigService, emailTemplateConfigRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';

// @ts-ignore
const emailTemplateConfigService: EmailTemplateConfigService = {
  setup: (app, path) => {
    app.get(path + '/get-by-name', async (req: any, res: any) => {
      try {
        const template = await emailTemplateConfigRepository.findOne(req.query);
        res.status(200).json({
          data: template,
        });
      } catch (error) {
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
    app.get(path + '/get-all', async (req: any, res: any) => {
      try {
        const template = await emailTemplateConfigRepository.findAll();
        res.status(200).json({
          data: template,
        });
      } catch (error) {
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
    app.get(path + '/find-by-ids', async (req: any, res: any) => {
      try {
        const data = await emailTemplateConfigRepository.findByIds(req.query.ids);
        res.status(200).json({
          data,
        });
      } catch (error) {
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
  },
  find: async ({ query, repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.EMAIL_TEMPLATES.VIEW);

    // 2. validate
    validateQuery(query);

    // 3. do business logic

    // 4. persist to db
    return await repository.find(query);
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.EMAIL_TEMPLATES.VIEW);

    // 2. validate
    if (!_id) {
      throw new EmailTemplateConfigInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.EMAIL_TEMPLATES.CREATE);

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
    await emailTemplateConfigService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.EMAIL_TEMPLATES.EDIT);

    // 2. validate
    if (!_id) {
      throw new EmailTemplateConfigInputError(params.translate('missingId'));
    }
    const existedEmailTemplateConfig: any = await params.repository.findById(_id);
    if (!existedEmailTemplateConfig) {
      throw new EntityNotFoundError('EmailTemplateConfig');
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

export default emailTemplateConfigService;
