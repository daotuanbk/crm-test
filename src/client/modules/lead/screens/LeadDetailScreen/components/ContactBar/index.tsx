import React from 'react';
import { Icon } from 'antd';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { LeadConversation } from '@client/services/service-proxies';
import { LEAD_CONVERSATION_EMAIL } from '@client/core';
import { MailModal } from '../MailModal';

interface State {
  modal: {
    email: boolean;
  };
}

interface Props {
  data: any;
  id: string;
}

export class ContactBar extends React.Component<Props, State> {
  leadEmailConversation: any;
  state: State = {
    modal: {
      email: false,
    },
  };

  async componentDidMount() {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const leadConversations = await serviceProxy.findLeadConversations(
      undefined,
      undefined,
      JSON.stringify([{
        leadId: this.props.id,
      }]),
      3,
      'createdAt|desc',
      undefined,
      undefined,
    ) as any;

    this.leadEmailConversation = leadConversations && leadConversations.data.find((item: LeadConversation) => {
      return item.channel === LEAD_CONVERSATION_EMAIL;
    });
  }

  toggleModal = (type: string) => () => {
    this.setState({
      modal: {
        ...this.state.modal,
        [type]: !this.state.modal[type],
      },
    });
  };

  render() {
    const { data } = this.props;
    return (
      <React.Fragment>
        <div className='contact-bar-group-icon'>
          <Icon type='phone' className='contact-bar-icon' />
          {
            data && data.contact && data.contact.email && (
              <Icon type='mail'
                onClick={this.toggleModal('email')}
                className='contact-bar-icon'
              />
            )
          }
          <Icon type='printer' className='contact-bar-icon' />
          <Icon type='ellipsis' className='contact-bar-icon' />
        </div>
        {
          this.state.modal.email && (
            // @ts-ignore
            <MailModal
              recipients={this.props.data && this.props.data.contact ? [this.props.data.contact.email] : undefined}
              visible={this.state.modal.email}
              leadConversationIds={this.leadEmailConversation ? [this.leadEmailConversation.id] : []}
              onCancel={this.toggleModal('email')}
              data={this.props.data}
            />
          )
        }
      </React.Fragment>
    );
  }
}
