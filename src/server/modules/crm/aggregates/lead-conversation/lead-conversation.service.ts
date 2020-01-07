import {
  CentreInputError,
  EntityNotFoundError,
  validateQuery,
  ensurePermission,
  validatePayload,
  validateOperation,
  logger, LEAD_MESSAGE_DETAIL_DIRECTION_IN,
} from '@app/core';
import {
  LeadConversationService,
  leadConversationRepository,
  systemConfigRepository,
  leadMessageDetailRepository,
} from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import { Request, Response } from 'express';
import axios from 'axios';
import moment from 'moment';

// @ts-ignore
const leadConversationService: LeadConversationService = {
  setup: (_app, _path) => {
    _app.get(_path + '/lead-stage-status/:stageId', async (req: Request, res: Response) => {
      try {
        const { stageId } = req.params;
        const stageStatuses = await leadConversationRepository.findLeadStageStatusByStageId(stageId);
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
        const stageStatuses = await leadConversationRepository.findLeadStageStatus();
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
        const stageStatuses = await leadConversationRepository.findLeadStages();
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
        const stageStatuses = await leadConversationRepository.findProspectingSources();
        res.status(200).json({
          data: stageStatuses,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || 'Internal server error');
      }
    });

    // post message to a conversation
    _app.post(_path + '/conversations/:conversationId', async (req: any, res: any) => {
      try {
        const leadConversation = await leadConversationRepository.getByFbConversationId(req.params.conversationId) as any;
        const pageAccessToken = (await systemConfigRepository.findOneByQuery({'value.page_id': leadConversation.fbPageId}) as any).value.access_token;
        await axios({
          url: `https://graph.facebook.com/${req.params.conversationId}/messages`,
          method: 'post',
          data: {
            message: req.body.message,
          },
          params: {
            access_token: pageAccessToken,
          },
        });
        const leadMessageDetailId = await leadMessageDetailRepository.create({
          conversationId: req.params.conversationId,
          ownerId: leadConversation.ownerId,
          channel: leadConversation.channel,
          direction: LEAD_MESSAGE_DETAIL_DIRECTION_IN,
          content: req.body.message,
          createdAt: moment().valueOf(),
        } as any);
        res.status(200).end({
          id: leadMessageDetailId,
          content: req.body.message,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
  },
  find: async ({ query, repository, authUser }) => {
    if (!query.operation) {
      // 1. authorize
      ensurePermission(authUser, PERMISSIONS.LEAD_CONVERSATIONS.VIEW);

      // 2. validate
      validateQuery(query);

      // 3. do business logic

      // 4. persist to db
      return await repository.find(query);
    } else {
      validateOperation(query.operation, ['getAllStages', 'getAllStatuses']);
      return await leadConversationService[query.operation]({ repository, authUser });
    }
  },
  getAllStages: async ({ repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.LEAD_CONVERSATIONS.VIEW);

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
    ensurePermission(authUser, PERMISSIONS.LEAD_CONVERSATIONS.VIEW);

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    const data = await repository.findLeadStageStatus();
    return await {
      data,
    };
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_CONVERSATIONS.VIEW);

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
    ensurePermission(params.authUser, PERMISSIONS.LEAD_CONVERSATIONS.CREATE);

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
    await leadConversationService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_CONVERSATIONS.EDIT);

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
  getByFbConversationId: async (fbConversationId) => {
    return await leadConversationRepository.getByFbConversationId(fbConversationId);
  },
};

export default leadConversationService;
