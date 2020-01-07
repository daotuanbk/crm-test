import {
  LeadMessageDetailInputError,
  EntityNotFoundError,
  validateQuery,
  ensurePermission,
  validatePayload,
  validateOperation, logger, LEAD_CONVERSATION_EMAIL, getFileName,
} from '@app/core';
import { LeadMessageDetailService, leadMessageDetailRepository, systemConfigRepository, leadAttachmentRepository,
  leadConversationRepository, leadRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import axios from 'axios';
import { config } from '@app/config';
import moment from 'moment';
// @ts-ignore
import imaps from 'imap-simple';
import { syncEmailMessageFromLead } from './helpers';

const leadMessageDetailService: LeadMessageDetailService = {
  setup: (app, path) => {
    // get messages from a conversation
    app.get(path + '/:conversationId/messages', async (req: any, res: any) => {
      try {
        const leadConversation = await leadConversationRepository.getByFbConversationId(req.params.conversationId) as any;
        const pageAccessToken = (await systemConfigRepository.findOneByQuery({'value.page_id': leadConversation.fbPageId}) as any).value.access_token;
        const messageDetailData = (await axios({
          url: `https://graph.facebook.com/${req.params.conversationId}/messages`,
          method: 'get',
          params: {
            access_token: pageAccessToken,
            fields: 'message,created_time,from,sticker,id,to,attachments',
          },
        }) as any).data;
        res.status(200).json(messageDetailData);
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
    app.post(path + '/sync-email-message', async (req: any, res: any) => {
      try {
        await leadMessageDetailService.syncEmailMessage(req.body.leadId);
        res.status(200).json({});
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
  },
  find: async ({ query, repository, authUser }) => {
    if (!query.operation) {
      // 1. authorize
      ensurePermission(authUser, PERMISSIONS.LEAD_MESSAGE_DETAILS.VIEW);

      // 2. validate
      validateQuery(query);

      // 3. do business logic

      // 4. persist to db
      return await repository.find(query);
    } else {
      validateOperation(query.operation, []);
      return await leadMessageDetailService[query.operation]({ repository, authUser });
    }
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_MESSAGE_DETAILS.VIEW);

    // 2. validate
    if (!_id) {
      throw new LeadMessageDetailInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_MESSAGE_DETAILS.CREATE);

    // 2. validate
    await validatePayload({
      // Validate object
    }, data);

    // 3. do business logic
    if (data.conversationIds && typeof data.conversationIds === 'object') {
      const promises = data.conversationIds.map((item: any) => {
        return createLeadMessageDetail({
          ...data,
          conversationId: item,
        }, params);
      });
      const ids = await Promise.all(promises);
      return ids.map((item: any) => ({id: item})) as any;
    }

    const id = await createLeadMessageDetail(data, params);
    return {id};
  },
  patch: async (id, data, params) => {
    validateOperation(data.operation, ['updateDetail']);
    await leadMessageDetailService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_MESSAGE_DETAILS.EDIT);

    // 2. validate
    if (!_id) {
      throw new LeadMessageDetailInputError(params.translate('missingId'));
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
    return await leadMessageDetailRepository.getByFbConversationId(fbConversationId);
  },
  syncEmailMessage: async (leadId: string) => {
    logger.info(`[Email-conversations] Start sync email-conversation of leadId: ${leadId}`);
    const conf = {
      imap: {
        user: config.emailAccount.contact.account,
        password: config.emailAccount.contact.password,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 10000,
      },
    };

    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new LeadMessageDetailInputError(`[Email-conversations] Not found lead: ${leadId}`);
    }
    const email = lead && lead.contact && lead.contact.email;
    if (!email) {
      throw new LeadMessageDetailInputError(`[Email-conversations] Not found email of lead: ${leadId}`);
    }

    const leadConversations = await leadConversationRepository.getByLeadId(leadId || lead && (lead as any).id);
    let leadEmailConversation = leadConversations.find((item: any) => {
      return item.channel === LEAD_CONVERSATION_EMAIL;
    });

    if (!leadEmailConversation) {
      const id = await leadConversationRepository.create({
        leadId,
        contactId: lead && lead.contact._id,
        channel: LEAD_CONVERSATION_EMAIL,
        createdAt: moment().valueOf(),
        email,
      } as any);
      logger.info(`[Email-conversations] Create Email LeadConversation`);
      leadEmailConversation = {
        id,
        leadId,
        contactId: lead && lead.contact._id,
      } as any;
    }

    logger.info(`[Email-conversations] Imaps connect`);
    await imaps.connect(conf).then(async (connection: any) => {
      logger.info(`[Email-conversations] Sync email message from lead`);
      await syncEmailMessageFromLead(connection, email, leadEmailConversation);
    });
  },
};

const createLeadMessageDetail = (data: any, params: any) => {
  return new Promise(async (resolve, _reject) => {
    if (data.conversationId) {
      const leadConversation = await leadConversationRepository.findById(data.conversationId) as any;
      let attachments: string[] = [];
      if (data.attachments && data.attachments.length) {
        const promises = data.attachments.map((attachmentUrl: string) => {
          const attachment = {
            leadId: leadConversation.leadId,
            contactId: leadConversation.contactId,
            title: getFileName(attachmentUrl),
            url: attachmentUrl,
            ...params.creationInfo,
          };
          return leadAttachmentRepository.create(attachment);
        });
        // @ts-ignore
        attachments = await Promise.all(promises);
      }
      // 4. persist to db
      const _id = await params.repository.create({
        ...data,
        attachments,
        ...params.creationInfo,
      });

      resolve(_id);
    } else {
      resolve();
    }
  });
};

export default leadMessageDetailService;
