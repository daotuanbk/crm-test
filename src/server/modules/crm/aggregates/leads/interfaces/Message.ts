import { IsAuditable } from '@app/core';

export type MessageTypes = 'EMAIL' | 'FACEBOOK_MESSAGE' | 'SMS';

export interface Message extends IsAuditable {
  messageType: MessageTypes;
  success: boolean;
  errorMessage: string;
  emailInfo?: {
    attachments: string[];
    subject: string;
    html: string;
    bcc: string;
  };
  smsInfo?: {};
  facebookMessageInfo?: {};
}
