import fs from 'fs';
import path from 'path';
import { leadAttachmentRepository, leadMessageDetailRepository } from '@app/crm';
import moment from 'moment';
import {
  LEAD_CONVERSATION_EMAIL,
  LEAD_MESSAGE_DETAIL_DIRECTION_IN,
  LEAD_MESSAGE_DETAIL_DIRECTION_OUT,
  logger,
} from '@app/core';
import imaps from 'imap-simple';

const defaultDay = 'March 25, 2019';

export const syncEmailMessageFromLead = async (connection: any, email: string, leadEmailConversation: any) => {
  connection.openBox('INBOX').then(async () => {
    const lastEmail = await leadMessageDetailRepository.find({
      sortBy: 'createdAt|des',
      filter: JSON.stringify([{
        conversationId: leadEmailConversation.id,
        direction: LEAD_MESSAGE_DETAIL_DIRECTION_OUT,
      }]),
      first: 1,
    }) as any;
    const lastCreatedAt = lastEmail && lastEmail.data && lastEmail.data.length !== 0 && lastEmail.data[0].createdAt;
    const lastCreatedAtStr = lastCreatedAt ? moment(lastCreatedAt).format('LL') : defaultDay;
    const searchCriteria = [
      ['FROM', email], ['SINCE', lastCreatedAtStr],
    ];

    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: false,
      struct: true,
    };

    return connection.search(searchCriteria, fetchOptions).then(async (results: any) => {
      logger.info(`[Email-conversations] Imaps search`);
      const promises = [];
      for (const i in results) {
        promises.push(new Promise(async (resolve, _reject) => {
          await createEmailMessageFromLead(connection, results[i], lastCreatedAt, leadEmailConversation);
          resolve();
        }));
      }
      await Promise.all(promises);
      logger.info(`[Email-conversations] Sync email message from manager`);
      syncEmailMessageFromManager(connection, email, leadEmailConversation);
    });
  });
};

export const syncEmailMessageFromManager = async (connection: any, email: string, leadEmailConversation: any) => {
  connection.openBox('[Gmail]/Sent Mail').then(async () => {
    const lastEmail = await leadMessageDetailRepository.find({
      sortBy: 'createdAt|des',
      filter: JSON.stringify([{
        conversationId: leadEmailConversation.id,
        direction: LEAD_MESSAGE_DETAIL_DIRECTION_IN,
      }]),
      first: 1,
    }) as any;
    const lastCreatedAt = lastEmail && lastEmail.data && lastEmail.data.length !== 0 && lastEmail.data[0].createdAt;
    const lastCreatedAtStr = lastCreatedAt ? moment(lastCreatedAt).format('LL') : defaultDay;
    const searchCriteria = [
      ['TO', email], ['SINCE', lastCreatedAtStr],
    ];

    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: false,
      struct: true,
    };

    logger.info(`[Email-conversations] Imaps search`);
    return connection.search(searchCriteria, fetchOptions).then(async (results: any) => {
      const promises = [];
      for (const i in results) {
        promises.push(new Promise(async (resolve, _reject) => {
          await createEmailMessageFromManager(connection, results[i], lastCreatedAt, leadEmailConversation);
          resolve();
        }));
      }
      await Promise.all(promises);
    });
  });
};

const getMailInfo = async (connection: any, result: any) => {
  const parts = imaps.getParts(result.attributes.struct);
  const partText = parts.filter((part: any) => part.subtype === 'plain' && part.type === 'text');
  let html = '';
  if (partText && partText[0] && partText[0].disposition === null && partText[0].encoding !== 'base64') {
    html = await connection.getPartData(result, partText[0]);
  }
  const mail = result.parts.filter((part: any) => {
    return part.which === 'HEADER';
  })[0].body;
  return {
    content: mail.subject && mail.subject[0],
    html,
    date: mail.date[0],
  };
};

const getAttachments = async (connection: any, result: any) => {
  const parts = imaps.getParts(result.attributes.struct);
  const attachmentsPromises = parts.filter((part: any) => {
    return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
  }).map((part: any) => {
    // retrieve the attachments only of the messages with attachments
    return connection.getPartData(result, part)
      .then((partData: any) => {
        return {
          filename: part.disposition.params.filename,
          buffer: partData,
        };
      });
  });
  const attachments = await Promise.all(attachmentsPromises);
  return attachments || [];
};

// @ts-ignore
const createEmailMessageFromManager = async (connection: any, result: any, createdAt?: number, leadEmailConversation: any) => {
  const attachmentInfos = await getAttachments(connection, result);
  const mailInfo = await getMailInfo(connection, result);
  const promises = [];
  let attachments: any;
  for (const i in attachmentInfos) {
    // tslint:disable-next-line: no-unnecessary-type-assertion
    const attachment = attachmentInfos[i] as any;
    promises.push(new Promise(async (resolve, _reject) => {
      // TODO check fileName and add time
      fs.writeFileSync(path.join(__dirname, `../../../../../../../temp/attachment/${attachment.filename}`), attachment.buffer);
      const attachmentId = await leadAttachmentRepository.create({
        leadId: leadEmailConversation.leadId,
        contactId: leadEmailConversation.contactId,
        title: attachment.filename,
        url: attachment.filename,
        createdAt: moment(mailInfo.date).valueOf(),
      } as any);
      resolve(attachmentId);
    }));
    attachments = await Promise.all(promises);
  }
  if (createdAt) {
    if (moment(mailInfo.date).valueOf() <= createdAt) {
      return;
    }
  }
  if (!mailInfo.content) return;
  // @ts-ignore
  const leadMessageDetail = {
    content: mailInfo.content,
    attachments: attachments || [],
    createdAt: moment(mailInfo.date).valueOf(),
    channel: LEAD_CONVERSATION_EMAIL,
    direction: LEAD_MESSAGE_DETAIL_DIRECTION_IN,
    html: mailInfo.html,
    conversationId: leadEmailConversation.id,
  } as any;
  await leadMessageDetailRepository.create(leadMessageDetail);
  logger.info(`[Email-conversations] Create LeadMessageDetail`);
};

const createEmailMessageFromLead = async (connection: any, result: any, createdAt: number, leadEmailConversation: any) => {
  const mailInfo = await getMailInfo(connection, result);
  if (createdAt) {
    if (moment(mailInfo.date).valueOf() <= createdAt) {
      return;
    }
  }
  const leadMessageDetail = {
    content: mailInfo.content,
    createdAt: moment(mailInfo.date).valueOf(),
    channel: LEAD_CONVERSATION_EMAIL,
    direction: LEAD_MESSAGE_DETAIL_DIRECTION_OUT,
    html: mailInfo.html,
    conversationId: leadEmailConversation.id,
    createdBy: leadEmailConversation.leadId,
  } as any;
  await leadMessageDetailRepository.create(leadMessageDetail);
  logger.info(`[Email-conversations] Create LeadMessageDetail`);
};
