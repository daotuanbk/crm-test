import React, { Component } from 'react';
import moment from 'moment';
import { IMessageDetail, IMessageDetailAttachment } from '@client/store/models/messenger/interface';
import { Icon } from 'antd';
import './styles.less';

export interface MessageProps {
  data: IMessageDetail;
  isMine: any;
  startsSequence: any;
  endsSequence: any;
  showTimestamp: any;
}

export class Message extends Component<MessageProps> {
  renderAttachments = (attachment: IMessageDetailAttachment) => {
    const type = attachment.mime_type.split('/')[0];
    switch (type) {
      case 'image':
        return (
          <img
            style={{ width: attachment.image_data.width < 400 ? attachment.image_data.width : 300, borderRadius: '10px' }}
            src={attachment.image_data.url}
          />
        );
      case 'application':
        return (
          <div style={{ color: '#000' }}>
            <Icon type='download' />
            <a style={{ color: '#fff' }} href={attachment.file_url}>{attachment.name}</a>
          </div>
        );
      default:
        return (
          <div style={{ color: '#000' }}>
            <Icon type='download' />
            <a style={{ color: '#fff' }} href={attachment.file_url}>{attachment.name}</a>
          </div>
        );
    }
  }
  render() {
    const {
      data,
      isMine,
      startsSequence,
      endsSequence,
      showTimestamp,
    } = this.props as MessageProps;

    const friendlyTimestamp = moment(data.created_time).format('LLLL');

    return (
      <div className={[
        'message',
        `${isMine ? 'mine' : ''}`,
        `${startsSequence ? 'start' : ''}`,
        `${endsSequence ? 'end' : ''}`,
      ].join(' ')}>
        {
          showTimestamp &&
          <div className='timestamp'>
            {friendlyTimestamp}
          </div>
        }

        <div className='bubble-container'>
          <div className='bubble' title={friendlyTimestamp}>
            {data.message}
            {data.attachments && data.attachments.data ? (
              <div>
                <br/>
                {this.renderAttachments(data.attachments.data[0])}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
