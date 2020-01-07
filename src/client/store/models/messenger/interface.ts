export interface IMessageDetail {
  message: string;
  created_time: string;
  from: {
    name: string;
    email: string;
    id: string;
  };
  id: string;
  to: {
    data: [{
      name: string;
      email: string;
      id: string;
    }];
  };
  attachments: {
    data: [IMessageDetailAttachment],
  };
}

export interface IMessageDetailAttachment {
  id: string;
  mime_type: string;
  name: string;
  size: number;
  file_url: string;
  image_data: {
    height: number;
    width: number;
    image_type: number;
    max_height: number;
    max_width: number;
    render_as_sticker: boolean;
    url: string;
    preview_url: string;
  };
}

export interface IConversation {
  data: IMessageDetail[];
}

export interface IMessage {
  id: string;
  snippet: string;
  updated_time: string;
  message_count: number;
  unread_count: number;
  tags: {
    data: [
      {
        name: string;
      }
    ],
  };
  participants: {
    data: [
      {
        name: string;
        email: string;
        id: string;
      },
      {
        name: string;
        email: string;
        id: string;
      }
    ],
  };
  former_participants: {
    data: object[];
  };
  senders: {
    data: [
      {
        name: string;
        email: string;
        id: string;
      },
      {
        name: string;
        email: string;
        id: string;
      }
    ],
  };
  messages: {
    data: [
      {
        id: string;
        created_time: string;
      },
      {
        id: string;
        created_time: string;
      },
      {
        id: string;
        created_time: string;
      }
    ],
  };
  can_reply: boolean;
  is_subscribed: boolean;
  link: string;
  attachments: {
    data: [
      {
        id: string,
        mime_type: string,
        name: string,
        size: number,
        file_url: string,
      }
    ],
  };
}

export interface IConversationList {
  data: IMessage[];
}

export interface ISendMessageParams {
  fbConversationId: string;
  content: string;
}

export interface IFormattedConversationList {
  photo: string;
  name: string;
  text: string;
  id: string;
}

export interface IPageDetail {
  access_token: string;
  category: string;
  name: string;
  id: string;
  tasks: string[];
}

export interface IPageList {
  data: IPageDetail[];
}

export interface MessengerState {
  conversationData: IConversation;
  conversationList: IConversationList;
  formattedConversationList: IFormattedConversationList[];
  conversationTitle: string;
  currentConversationId: string;
  textMessage: string;
  userAccessToken: string;
  pageList: IPageList;
}
