import React, { Component } from 'react';
import moment from 'moment';
import { IMessageDetail, ISendMessageParams } from '@client/store/models/messenger/interface';
import { Spin } from 'antd';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { Compose } from '../Compose';
import { ToolbarButton } from '../ToolbarButton';
import { Message } from '../Message';
import './styles.less';

const PAGE_IDS = ['322966295167213', '435780759930195', '475309432639381'];

export interface MessageListProps {
  conversationData: [];
  currentConversationId: '';
  textMessage: '';
  isLoading: boolean;
  contactId?: string;
  setCurrentTextMessage: (text: string) => void;
  loadMoreData: () => void;
  uploadAttachments: (payload: any) => void;
  sendMessageEffects: (payload: ISendMessageParams) => void;
}

export class MessageList extends Component<MessageListProps> {
  messageList: any;

  constructor(props: any) {
    super(props);
  }

  async componentDidMount() {
    const { contactId } = this.props;
    if (contactId) {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      serviceProxy.updateContact(contactId, {
        operation: 'updateLastMessageStatus',
      });
    }
    if (this.messageList) {
      this.messageList.scrollTop = this.messageList.scrollHeight;
      this.messageList.addEventListener('scroll', () => {
        if (this.messageList.scrollTop === 0) {
          this.props.loadMoreData();
        }
      });
    }
  }

  renderMessages() {
    if (typeof this.props.conversationData === 'undefined' || this.props.conversationData.length === 0) {
      return;
    }
    let i = 0;
    const messageCount = this.props.conversationData.length;
    const messages = [];

    while (i < messageCount) {
      const previous: IMessageDetail = this.props.conversationData[i - 1];
      const current: IMessageDetail = this.props.conversationData[i];
      const next: IMessageDetail = this.props.conversationData[i + 1];
      const isMine = PAGE_IDS.find((item: string) => item === current.from.id);
      const currentMoment = moment(current.created_time);
      let prevBySameAuthor = false;
      let nextBySameAuthor = false;
      let startsSequence = true;
      let endsSequence = true;
      let showTimestamp = true;

      if (previous) {
        const previousMoment = moment(previous.created_time);
        const previousDuration = moment.duration(currentMoment.diff(previousMoment));
        prevBySameAuthor = previous.from.id === current.from.id;

        if (prevBySameAuthor && previousDuration.as('hours') < 1) {
          startsSequence = false;
        }

        if (previousDuration.as('hours') < 1) {
          showTimestamp = false;
        }
      }

      if (next) {
        const nextMoment = moment(next.created_time);
        const nextDuration = moment.duration(nextMoment.diff(currentMoment));
        nextBySameAuthor = next.from.id === current.from.id;

        if (nextBySameAuthor && nextDuration.as('hours') < 1) {
          endsSequence = false;
        }
      }

      messages.push(
        <Message
          key={i}
          isMine={isMine}
          startsSequence={startsSequence}
          endsSequence={endsSequence}
          showTimestamp={showTimestamp}
          data={current}
        />,
      );

      // Proceed to the next message.
      i += 1;
    }

    return messages;
  }

  render() {
    const {isLoading} = this.props;

    return (
      <div className='message-list'>
        <div className='message-list-container scrollable' ref={(ele: any) => {this.messageList = ele; }}>
          {
            isLoading && (
                <div style={{height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><Spin /></div>
            )
          }
          {this.renderMessages()}
        </div>

        <Compose rightItems={[<ToolbarButton key='send' icon='ion-ios-send' />]}
          currentConversationId={this.props.currentConversationId}
          textMessage={this.props.textMessage}
          setCurrentTextMessage={this.props.setCurrentTextMessage}
          sendMessageEffects={this.props.sendMessageEffects}
          uploadAttachments={this.props.uploadAttachments}
        />
      </div>
    );
  }
}
