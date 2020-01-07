import { RequestParams, BULK_OPERATION_ID, EMAIL_MESSAGE_TYPE, transporter, getFileName, ensurePermission } from '@app/core';
import { LeadsRepository, MessageTypes, SendEmailPayload, leadRepository } from '@app/crm';
import { config } from '@app/config';
import path from 'path';
import { BadRequest } from '@feathersjs/errors';
import { get } from 'lodash';
import { PERMISSIONS } from '@common/permissions';

const sendOneEmail = async (id: string, data: SendEmailPayload, params: RequestParams<LeadsRepository>) => {
  const leadInfo = await leadRepository.findById(id);
  if (!leadInfo) {
    throw new BadRequest('Lead not found');
  }

  const messageInfo = {
    messageType: EMAIL_MESSAGE_TYPE as MessageTypes,
    success: false,
    errorMessage: '',
    emailInfo: {
      attachments: data.attachments,
      subject: data.subject,
      html: data.html,
      bcc: data.bcc,
    },
    ...params.creationInfo,
  };
  await leadRepository.update({
    id,
    messages: leadInfo.messages ? [...leadInfo.messages, messageInfo] : [messageInfo],
  });

  transporter.sendMail({
    from: config.emailAccount.contact.account,
    to: [get(leadInfo, ['customer', 'email'], '')],
    subject: data.subject,
    html: data.html,
    bcc: data.bcc,
    attachments: data.attachments ? data.attachments.map((item: string) => {
      return {
        path: `${path.resolve(__dirname, `../../../../../../../temp/attachment`)}/${item}`,
        filename: getFileName(item),
      };
    }) : [],
  });
};

export const sendEmail = async (id: string, data: any, params: RequestParams<LeadsRepository>) => {

  const { authUser } = params;

  ensurePermission(authUser, PERMISSIONS.LEADS.EDIT);

  // Validate payload

  if (id === BULK_OPERATION_ID) {
    // Send many emails
    const sendEmailPromises: any[] = [];
    for (const item of data.leads) {
      sendEmailPromises.push(sendOneEmail(item, data, params));
    }
    await Promise.all(sendEmailPromises);
  } else {
    // Send 1 email
    await sendOneEmail(id, data, params);
  }
  return {};
};
