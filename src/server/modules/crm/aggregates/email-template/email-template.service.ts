
import { EmailTemplateService, emailTemplateRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import { EmailTemplateInputError, EntityNotFoundError, validateQuery, ensurePermission, validatePayload, validateOperation } from '@app/core';
import * as yup from 'yup';

// @ts-ignore
const emailTemplateService: EmailTemplateService = {
  setup: (app, path) => {
    app.get(path + '/get-all-template', async (req: any, res: any) => {
      try {
        const templates = await emailTemplateRepository.findAll();
        res.status(200).json({
          data: templates,
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
      throw new EmailTemplateInputError(params.translate('missingId'));
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
    await emailTemplateService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.EMAIL_TEMPLATES.EDIT);

    // 2. validate
    if (!_id) {
      throw new EmailTemplateInputError(params.translate('missingId'));
    }
    const existedEmailTemplate: any = await params.repository.findById(_id);
    if (!existedEmailTemplate) {
      throw new EntityNotFoundError('EmailTemplate');
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
      throw new EmailTemplateInputError(params.translate('missingId'));
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

export default emailTemplateService;
