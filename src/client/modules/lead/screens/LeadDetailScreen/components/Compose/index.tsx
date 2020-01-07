import React, { Component } from 'react';
import { Upload } from 'antd';
import { config } from '@client/config';
import { ToolbarButton } from '../ToolbarButton';
import './styles.less';

export interface ComposeProps {
  rightItems: any;
  currentConversationId: '';
  textMessage: '';
  sendMessageEffects: (payload: any) => void;
  uploadAttachments: (payload: any) => void;
  setCurrentTextMessage: (text: string) => void;
}

interface ComposeState {
  fileList: any[];
}

export class Compose extends Component<ComposeProps, ComposeState> {
  text: string;

  textKey: any;

  constructor(props: any) {
    super(props);
    this.state = {
      fileList: [],
    };
    this.text = '';
    this.textKey = new Date().getTime();
  }

  onSendingMessage = async () => {
    this.props.sendMessageEffects({ content: this.text });
    this.textKey = new Date().getTime();
    this.forceUpdate();
  }

  handleUploadChange = ({ file, fileList }: any) => {
    this.setState({ fileList: [...fileList] });
    if (file.status !== 'uploading') {
      this.props.sendMessageEffects({
        attachments: this.getAttachmentList(),
        content: 'send attachments',
      });
      this.setState({fileList: []});
    }
  };

  getAttachmentList = () => {
    return this.state.fileList.map((attachment) => (attachment.response));
  };

  render() {
    return (
      <div className='compose'>
        <div className='message-input' key={this.textKey}>
          <input
              onKeyUp={(e) => {
                if (e.keyCode === 13) {
                  e.preventDefault();
                  this.onSendingMessage();
                }
              }}
              type='text'
              className='compose-input'
              placeholder='Type a message, @name'
              onChange={(e) => {this.text = e.target.value; }}
          />
        </div>
        <div style={{display: 'flex'}}>
          <Upload
            action={`${config.url.api}/upload-attachment`}
            onChange={this.handleUploadChange}
            name={'attachment'}
            fileList={this.state.fileList}
          >
            <ToolbarButton key='image' icon='ion-ios-attach'/>
          </Upload>
          <div onClick={() => this.onSendingMessage()}>
            {(this.props as any).rightItems}
          </div>
        </div>
      </div >
    );
  }
}
