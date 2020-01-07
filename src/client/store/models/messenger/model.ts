import { ModelConfig, createModel } from '@rematch/core';
import { MessengerState, ISendMessageParams } from './interface';
import { message } from 'antd';
import axios from 'axios';
import { config } from '../../../config';
import firebase from 'firebase';

const initialState: MessengerState = {
  conversationData: {
    data: [],
  },
  conversationList: {
    data: [],
  },
  formattedConversationList: [],
  conversationTitle: '',
  currentConversationId: '',
  textMessage: '',
  userAccessToken: '',
  pageList: {
    data: [],
  },
};

const messengerModel: ModelConfig<MessengerState> = createModel({
  state: initialState,
  reducers: {
    getConversationListSuccess: (
      state: MessengerState,
      payload: any,
    ): MessengerState => {
      return {
        ...state,
        formattedConversationList: payload,
      };
    },
    getConversationDataSuccess: (
      state: MessengerState,
      payload: any,
    ): MessengerState => {
      return {
        ...state,
        conversationData: payload,
      };
    },
    setCurrentConversationId: (
      state: MessengerState,
      payload: any,
    ): MessengerState => {
      return {
        ...state,
        currentConversationId: payload,
      };
    },
    setCurrentTextMessage: (
      state: MessengerState,
      payload: any,
    ): MessengerState => {
      return {
        ...state,
        textMessage: payload,
      };
    },
    getListPageSuccess: (
      state: MessengerState,
      payload: any,
    ): MessengerState => {
      return {
        ...state,
        pageList: payload,
      };
    },
  },
  effects: {
    async sendMessageEffects(
        payload: ISendMessageParams,
        _rootState: any,
    ): Promise<void> {
      try {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        await axios({
          url: `${config.url.api}/lead-message-detail/`,
          method: 'post',
          data: payload,
          headers: {
            Authorization: idToken,
          },
        });
      } catch (error) {
        message.error(error.message);
      }
    },
  },
});

export default messengerModel;
