import { MailState } from './interface';
import { message } from 'antd';
import { ModelConfig, createModel } from '@rematch/core';
import { config } from '@client/config';
import axios from 'axios';
import firebase from 'firebase';

const initialState: MailState = {
  conversationList: [],
  formattedConversationList: [],
  conversationTitle: '',
  currentConversationId: '',
  textMessage: '',
  userAccessToken: '',
  currentConversation: '',
  attachmentList: [],
};

const mailModel: ModelConfig<MailState> = createModel({
  state: initialState,
  reducers: {
    getConversationListSuccess: (
      state: MailState,
      payload: any,
    ): MailState => {
      return {
        ...state,
        formattedConversationList: payload.formattedConversationList,
        conversationList: payload.conversationList,
      };
    },
    setCurrentConversation: (
      state: MailState,
      payload: any,
    ): MailState => {
      return {
        ...state,
        currentConversationId: payload,
        currentConversation: state.conversationList.filter((c) => c.messageId === payload)[0].textAsHtml,
      };
    },
    setAttachmentList: (
      state: MailState,
      payload: any,
    ): MailState => {
      return {
        ...state,
        attachmentList: payload,
      };
    },
  },
  effects: {
    async sendEmailEffects(
      payload: any,
      _rootState: any,
    ): Promise<boolean> {
      try {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        await axios({
          url: `${config.url.api}/lead-message-detail`,
          method: 'post',
          data: {
            ...payload,
          },
          headers: {
            Authorization: idToken,
          },
        });
        message.success('Send mail successfully!');
        return true;
      } catch (error) {
        message.error(error.message);
        return false;
      }
    },
  },
});

export default mailModel;
