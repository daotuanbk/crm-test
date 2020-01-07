import {
  Hook,
  addCreationInfo,
  addModificationInfo,
  logApiRequest,
  authenticate,
  logger, LEAD_CONVERSATION_FBCHAT,
} from '@app/core';
import {
  leadConversationRepository,
  leadAttachmentRepository,
  systemConfigRepository,
} from '@app/crm';
import axios from 'axios';

const afterCreate = async (context: any) => {
  try {
    const {channel} = context.data;
    switch (channel) {
      case LEAD_CONVERSATION_FBCHAT:
        await postMessageToFb(context);
        break;
    }
  } catch (error) {
    logger.error(error);
  }
};

const postMessageToFb = async (context: any) => {
  try {
    const {conversationId} = context.data;
    const leadConversation = await leadConversationRepository.findById(conversationId) as any;
    const fbConversationId = leadConversation.fbConversationId;
    const pageAccessToken = (await systemConfigRepository.findOneByQuery({'value.page_id': leadConversation.fbPageId}) as any).value.access_token;
    await axios({
      url: `https://graph.facebook.com/${fbConversationId}/messages`,
      method: 'post',
      data: {
        message: context.data.content,
      },
      params: {
        access_token: pageAccessToken,
      },
    });
    logger.info(`[LeadAttachmentHook-After Create] Post message to facebook success`);
  } catch (error) {
    logger.error(error);
  }
};

const leadAttachmentHook: Hook = {
  before: {
    all: [
      authenticate,
      logApiRequest,
      async (context: any) => {
        context.params.repository = leadAttachmentRepository;
      },
    ],
    create: [
      addCreationInfo,
    ],
    patch: [
      addModificationInfo,
    ],
  },
  after: {
    create: [
      afterCreate,
    ],
  },
};

export default leadAttachmentHook;
