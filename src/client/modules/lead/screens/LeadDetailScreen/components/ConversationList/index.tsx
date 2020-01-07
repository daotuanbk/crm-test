import React, { Component } from 'react';
import { ConversationSearch } from '../ConversationSearch';
import { ConversationListItem } from '../ConversationListItem';
import { Toolbar } from '../Toolbar';
import { ToolbarButton } from '../ToolbarButton';
import './styles.less';

export interface ConversationListProps {
  formattedConversationList: [];
  onNewMessage: () => void;
  onConversationClick: (id: string) => void;
}

export default class ConversationList extends Component<ConversationListProps> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className='conversation-list'>
        <Toolbar
          title='Messenger'
          leftItems={[
            <ToolbarButton key='cog' icon='ion-ios-cog' />,
          ]}
          rightItems={[
            <ToolbarButton key='add' icon='ion-ios-add-circle-outline' />,
          ]}
          onNewMessage={this.props.onNewMessage}
        />
        <ConversationSearch />
        {
          this.props.formattedConversationList.map((conversation: any) =>
            <ConversationListItem
              key={conversation.id}
              data={conversation}
              onConversationClick={this.props.onConversationClick}
            />,
          )
        }
      </div>
    );
  }
}
