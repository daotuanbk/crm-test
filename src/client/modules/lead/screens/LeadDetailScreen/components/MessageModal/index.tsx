import React from 'react';
import { Modal } from 'antd';
import { initStore, withRematch } from '@client/store';
import io from 'socket.io-client';
import { config } from '@client/config';
import Push from 'push.js';
import { ISendMessageParams } from '@client/store/models/messenger/interface';
import { LEAD_CONVERSATION_FBCHAT, LEAD_MESSAGE_DETAIL_DIRECTION_IN } from '@client/core';
import axios from 'axios';
import { Messenger } from '../Messenger';
import './styles.less';

interface State {
  conversationData: {
    data: [];
  };
  isLoading: boolean;
}

interface MessageModalProps {
  formattedConversationList: [];
  conversationData: { data: { data: [] } };
  currentConversationId: '';
  textMessage: '';
  getConversationDataEffects: (id: string) => void;
  setCurrentTextMessage: (text: string) => void;
  getConversationListEffects: () => void;
  sendMessageEffects: (payload: ISendMessageParams) => void;
  uploadAttachments: (payload: any) => void;
  setCurrentConversationId: (id: string) => void;
}

interface Props extends MessageModalProps {
  initialValue: any;
  handleSubmit: any;
  visible: boolean;
  title: string;
  loading: boolean;
  leadFbConversation: any;
  onDelete: (id: string) => void;
  closeModal: () => void;
}

export class MessageModal extends React.Component<Props, State> {
  nextPage: string;
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      conversationData: {
        data: [],
      },
    };
    this.nextPage = '';
  }

  componentDidUpdate(prevProps: Readonly<Props>, _prevState: Readonly<State>, _snapshot?: any): void {
    if (prevProps.leadFbConversation !== this.props.leadFbConversation) {
      this.props.setCurrentConversationId(this.props.leadFbConversation && this.props.leadFbConversation.fbConversationId || '');
      this.getConversationData();
    }
  }

  getConversationData = async () => {
    const {leadFbConversation} = this.props;
    if (!leadFbConversation) return;
    const result = await axios({
      url: `${config.url.api}/lead-message-detail/${leadFbConversation.fbConversationId}/messages`,
      method: 'get',
    });
    result.data.data = result.data.data.reverse();
    this.nextPage = result.data && result.data.paging && result.data.paging.next;
    this.setState({
      isLoading: false,
      conversationData: result.data,
    });
  };

  loadMoreData = async () => {
    if (this.state.isLoading || !this.nextPage) return;
    this.setState({
      isLoading: true,
    }, async () => {
      const result = await axios(this.nextPage);
      result.data.data = result.data.data.reverse();
      const nextState = {isLoading: false} as any;
      if (result && result.data) {
        this.nextPage = result.data && result.data.paging && result.data.paging.next;
        nextState.conversationData = {
          ...this.state.conversationData,
          data: [
            ...result.data.data,
            ...this.state.conversationData.data,
          ],
        };
      }
      this.setState(nextState);
    });
  };

  componentDidMount = async () => {
    this.getConversationData();
    const socket = io(config.socketio.main);
    socket.on('messages', (_data: any) => {
      Push.create('Techkids Crm', {
        body: 'You have a new message!',
        icon: '../static/favicon.ico',
        timeout: 4000,
      });
      this.getConversationData();
    });
  };

  componentWillUnmount() {
    const socket = io(config.socketio.main);
    socket.close();
  }

  sendMessageEffects = async (payload: any) => {
    if (!payload.content) return;
    const {leadFbConversation} = this.props;
    this.props.sendMessageEffects({
        ...payload,
      conversationId: leadFbConversation && leadFbConversation.id,
      fbConversationId: leadFbConversation && leadFbConversation.fbConversationId,
      direction: LEAD_MESSAGE_DETAIL_DIRECTION_IN,
      channel: LEAD_CONVERSATION_FBCHAT,
    });
    this.getConversationData();
  };

  render() {
    const { leadFbConversation } = this.props;

    return (
        <Modal
          className='lead-message-modal'
          width={600}
          title='CHAT'
          visible={this.props.visible}
          onCancel={this.props.closeModal}
          confirmLoading={this.props.loading}
          footer={null}
        >
          <Messenger
            contactId={leadFbConversation && leadFbConversation.contactId || ''}
            formattedConversationList={this.props.formattedConversationList}
            getConversationDataEffects={this.getConversationData}
            conversationData={this.state.conversationData.data}
            currentConversationId={this.props.currentConversationId}
            textMessage={this.props.textMessage}
            setCurrentTextMessage={this.props.setCurrentTextMessage}
            sendMessageEffects={this.sendMessageEffects}
            uploadAttachments={this.props.uploadAttachments}
            loadMoreData={this.loadMoreData}
            isLoading={this.state.isLoading}
          />
        </Modal>
    );
  }
}

const mapState = (rootState: any) => {
  return {
    ...rootState.messengerModel,
  };
};

const mapDispatch = (rootReducer: any) => {
  return {
    ...rootReducer.messengerModel,
  };
};
export default withRematch(initStore, mapState, mapDispatch)(MessageModal);
