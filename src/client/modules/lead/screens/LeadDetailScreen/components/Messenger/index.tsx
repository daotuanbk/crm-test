import React, { Component } from 'react';
import { ISendMessageParams } from '@client/store/models/messenger/interface';
import { MessageList } from '../MessageList';
import './styles.less';

export interface MessengerProps {
  formattedConversationList: [];
  conversationData: [];
  currentConversationId: '';
  textMessage: '';
  isLoading: boolean;
  contactId?: string;
  getConversationDataEffects: (id: string) => void;
  sendMessageEffects: (payload: ISendMessageParams) => void;
  setCurrentTextMessage: (text: string) => void;
  uploadAttachments: (payload: any) => void;
  loadMoreData: () => void;
}

export class Messenger extends Component<MessengerProps> {
  render() {
    return (
      <div className='messenger'>
        <div className='content'>
          <MessageList
            contactId={this.props.contactId}
            conversationData={this.props.conversationData}
            currentConversationId={this.props.currentConversationId}
            textMessage={this.props.textMessage}
            setCurrentTextMessage={this.props.setCurrentTextMessage}
            sendMessageEffects={this.props.sendMessageEffects}
            uploadAttachments={this.props.uploadAttachments}
            loadMoreData={this.props.loadMoreData}
            isLoading={this.props.isLoading}
          />
        </div>
      </div>
    );
  }
}
