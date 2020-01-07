import { IFormattedConversationList } from '../messenger/interface';

export interface IMail {
  date: Date;
  subject: string;
  from: {
    value: [object],
    html: string;
    text: string;
  };
  to: {
    value: [object],
    html: string;
    text: string;
  };
  replyTo: {
    value: [object],
    html: string;
    text: string;
  };
  messageId: string;
  html: string;
  attachments: [];
  textAsHtml: string;
}

export interface MailState {
  // conversationData: IConversation;
  conversationList: IMail[];
  formattedConversationList: IFormattedConversationList[];
  conversationTitle: string;
  currentConversationId: string;
  textMessage: string;
  userAccessToken: string;
  currentConversation: string;
  attachmentList: string[];
}
