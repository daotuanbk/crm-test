import {
  Hook,
  addCreationInfo,
  addModificationInfo,
  logApiRequest,
  authenticate,
  logger, LEAD_CONVERSATION_FBCHAT,
  LEAD_CONVERSATION_EMAIL, getFileName,
  ACTION_TYPE_CONVERSATION,
} from '@app/core';
import {
  leadConversationRepository,
  leadMessageDetailRepository,
  systemConfigRepository,
  leadRepository,
  contactRepository,
  leadHistoryRepository,
} from '@app/crm';
import axios from 'axios';
import { config } from '@app/config';
import nodemailer from 'nodemailer';
import * as path from 'path';
import FormData from 'form-data';
import * as fs from 'fs';

const afterCreate = async (context: any) => {
  try {
    const {channel} = context.data;
    switch (channel) {
      case LEAD_CONVERSATION_FBCHAT:
        await postMessageToFb(context);
        break;
      case LEAD_CONVERSATION_EMAIL:
        await postEmail(context);
        break;
    }
  } catch (error) {
    logger.error(error);
  }
};

const transporterSendMail = (data: any) => {
  return new Promise(async (resolve, _reject) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: config.emailAccount.contact.account,
        pass: config.emailAccount.contact.password,
      },
    });

    const attachments = (data.attachments && data.attachments.length > 0) ?
      data.attachments.map((attachment: string) => ({
        path: `${path.join(__dirname, `../../../../../../temp/attachment`)}/${attachment}`,
        filename: getFileName(attachment),
      })) : [];

    const mailOptions = {
      from: 'contact@mindx.edu.vn',
      to: data.recipient,
      subject: data.content,
      html: data.html,
      attachments,
    };
    await transporter.sendMail(mailOptions);
    logger.info(`[LeadMessageDetailHook-After Create] Send email success`);
    resolve();
  });
};

const postEmail = async (context: any) => {
  const data = context.data;
  // @ts-ignore
  if (data.recipients && typeof data.recipients === 'object') {
    const promises = data.recipients.map((item: string) => {
      return transporterSendMail({
        ...data,
        recipient: item,
      });
    });
    return await Promise.all(promises);
  }

  return await transporterSendMail(data);
};

const postMessageToFb = async (context: any) => {
  try {
    logger.info(`[LeadMessageDetailHook-After Create]`);
    const data = context.data;
    const {conversationId} = context.data;
    const leadConversation = await leadConversationRepository.findById(conversationId) as any;
    const fbConversationId = leadConversation.fbConversationId;
    const systemConfig = await systemConfigRepository.findOneByQuery({'value.page_id': leadConversation.fbPageId});
    const pageAccessToken = systemConfig.value.access_token;
    if (data.attachments && data.attachments.length) {
      const bodyFormData = new FormData();
      bodyFormData.append('filedata', fs.createReadStream(`${path.join(__dirname, `../../../../../../temp/attachment`)}/${data.attachments[0]}`));
      await axios({
        url: `https://graph.facebook.com/${fbConversationId}/messages`,
        method: 'post',
        params: {
          access_token: pageAccessToken,
        },
        data: bodyFormData,
        headers: { ...bodyFormData.getHeaders() },
      });
      logger.info(`[LeadMessageDetailHook-After Create] Send attachment to facebook success`);
    }
    else {
      await axios({
        url: `https://graph.facebook.com/${fbConversationId}/messages`,
        method: 'post',
        data: {
          message: data.content,
        },
        params: {
          access_token: pageAccessToken,
        },
      });
      logger.info(`[LeadMessageDetailHook-After Create] Post message to facebook success`);
    }
  } catch (error) {
    logger.error(error);
  }
};

const historyLogging = async (context: any) => {
  const data = context.data;
  if (data && data.conversationIds) {
    const promises = data.conversationIds.map((conversationId: string, index: number) => {
      return logOneItem({
        ...data,
        conversationId,
        recipient: data.recipients && data.recipients[index] ? data.recipients[index] : undefined,
      }, context.params.authUser);
    });
    await Promise.all(promises);
  }
};

const logOneItem = async (data: any, authUser: any) => {
  const conversation = await leadConversationRepository.findById(data.conversationId) as any;
  if (conversation) {
    if (conversation.leadId) {
      // query lead
      const lead = await leadRepository.findById(conversation.leadId) as any;
      if (lead) {
        await leadHistoryRepository.create({
          actionType: ACTION_TYPE_CONVERSATION,
          actionCreatedBy: data.direction === 2 ? {} : {
            _id: authUser ? authUser._id : undefined,
            name: authUser ? authUser.fullName : undefined,
          },
          actionCreatedWhen: Date.now(),
          leadId: lead._id,
          name: lead.contact ? lead.contact.fullName : '',
          currentCentre: lead.centre ? {
            _id: lead.centre._id,
            name: lead.centre.name,
          } : undefined,
          currentStage: lead.currentStage,
          currentStatus: lead.currentStatus,
          currentOwner: lead.owner ? {
            _id: lead.owner.id ? lead.owner.id._id : undefined,
            name: lead.owner.fullName,
          } : undefined,
          conversation: {
            content: data.content,
            conversationType: data.channel ?
              (data.channel === 1 ? 'FB Chat' : (data.channel === 2 ? 'Email' : 'Phone call')) : undefined,
            starter: data.direction === 2 ? (data.recipient || undefined) : (authUser ? authUser.fullName : undefined),
          },
        } as any);
      }
    } else if (conversation.contactId) {
      const contact = await contactRepository.findById(conversation.contactId) as any;
      if (contact) {
        const fullName = contact.contactBasicInfo ?
        (contact.contactBasicInfo.firstName ? contact.contactBasicInfo.firstName : '') + (contact.contactBasicInfo.firstName ? ' ' : '') + (contact.contactBasicInfo.lastName ?
          contact.contactBasicInfo.lastName : '')
        : '';
        await leadHistoryRepository.create({
          actionType: ACTION_TYPE_CONVERSATION,
          actionCreatedBy: data.direction === 2 ? {} : {
            _id: authUser ? authUser._id : undefined,
            name: authUser ? authUser.fullName : undefined,
          },
          actionCreatedWhen: Date.now(),
          contactId: conversation.contactId,
          name: fullName || '',
          currentCentre: contact.centre ? {
            _id: contact.centre._id,
            name: contact.centre.name,
          } : undefined,
          currentStage: contact.currentStage,
          currentStatus: contact.currentStatus,
          currentOwner: contact.ownerId ? {
            _id: contact.ownerId.id,
            name: contact.ownerId.fullName,
          } : undefined,
          conversation: {
            content: data.content,
            html: data.html || undefined,
            conversationType: data.channel ?
              (data.channel === 1 ? 'FB Chat' : (data.channel === 2 ? 'Email' : 'Phone call')) : undefined,
            starter: data.direction === 2 ? (data.recipient || undefined) : (authUser ? authUser.fullName : undefined),
          },
        } as any);
      }
    }
  }
};

const leadMessageDetailHook: Hook = {
  before: {
    all: [
      authenticate,
      logApiRequest,
      async (context: any) => {
        context.params.repository = leadMessageDetailRepository;
      },
    ],
    create: [
      addCreationInfo,
      historyLogging,
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

export default leadMessageDetailHook;
