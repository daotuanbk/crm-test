import React, { Component } from 'react';
import './styles.less';

export interface ConversationListItemProps {
  data: any;
  onConversationClick: (id: string) => void;
}

const truncate = (text: string) => {
  if (text.length > 36) {
    return text.substring(0, 36) + '...';
  } else {
    return text;
  }
};

export class ConversationListItem extends Component<ConversationListItemProps> {
  render() {
    const { photo, name, text, id } = (this.props as any).data;
    return (
      <div onClick={() => this.props.onConversationClick(id)} className='conversation-list-item'>
        <img className='conversation-photo' src={photo} alt={name} />
        <div className='conversation-info'>
          <h1 className='conversation-title'>{name}</h1>
          <p className='conversation-snippet'>{truncate(text)}</p>
        </div>
      </div>
    );
  }
}
