import React from 'react';
import { SectionBox, BorderWrapper } from '@client/components';
import { Row, Col, Icon, Avatar, Comment, Tooltip, Spin, Select, Modal, message } from 'antd';
import moment from 'moment';
import { LeadMessageDetail, LeadConversation, User } from '@client/services/service-proxies';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { PERMISSIONS } from '@common/permissions';
import {
  LEAD_CONVERSATION_FBCHAT,
  LEAD_MESSAGE_DETAIL_DIRECTION_IN,
  LEAD_MESSAGE_DETAIL_DIRECTION_OUT,
  LEAD_CONVERSATION_EMAIL,
  getProspectingSourceName,
  timeAgo,
} from '@client/core';
import { translate } from '@client/i18n';
import { MessageModal } from '../MessageModal';
import { MailModal } from '../MailModal';
import { EmailMessage } from '../EmailMessage';
import './styles.less';

interface State {
  search: string;
  conversations: LeadMessageDetail[];
  before: any;
  after: any;
  sortBy: string;
  pageSize: number;
  isLoading: boolean;
  allLeadConversations: LeadConversation[];
  isShowing: boolean;
  modal: {
    message: boolean;
    email: boolean;
  };
  currentLeadMessageDetail?: LeadMessageDetail;
  selectCentreModal: boolean;
  selectCentreData: any;
  selectOwnerModal: boolean;
  selectOwnerData: any;
}

interface Props {
  data: any;
  id: string;
  users: User[];
  centres: any;
  salesmen: any;
  authUser: any;
  updateLead: (payload: any) => Promise<void>;
  changeInput: (payload: any) => void;
}

export class LeadManagement extends React.Component<Props, State> {
  state: State = {
    search: '',
    conversations: [],
    before: undefined,
    after: undefined,
    sortBy: 'createdAt|des',
    pageSize: 5,
    isLoading: false,
    allLeadConversations: [],
    isShowing: true,
    modal: {
      message: false,
      email: false,
    },
    selectCentreModal: false,
    selectCentreData: {},
    selectOwnerModal: false,
    selectOwnerData: {},
    currentLeadMessageDetail: undefined,
  };

  async componentDidMount() {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const allLeadConversations = await serviceProxy.findLeadConversations(
        undefined,
        '',
        JSON.stringify([{
          $or : [
            {leadId: this.props.id},
            {contactId: this.props.id},
          ],
        }]),
        3,
        this.state.sortBy,
        undefined,
        undefined,
        );
    this.setState({
      allLeadConversations: allLeadConversations.data,
    }, async () => {
      await this.handleSearch();
    });
  }

  checkPermissionAssign = () => {
    return this.props.authUser
      && this.props.authUser.permissions
      && this.props.authUser.permissions.indexOf(PERMISSIONS.LEADS.ASSIGN) >= 0 ? true : false;
  }

  checkPermissionCentre = () => {
    return this.props.authUser
      && this.props.authUser.permissions
      && this.props.authUser.permissions.indexOf(PERMISSIONS.LEADS.CENTRE) >= 0 ? true : false;
  }

  handleSearch = async () => {
    const {isLoading, allLeadConversations, after} = this.state;
    if (isLoading) return;

    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    this.setState({
      isLoading: true,
    }, async () => {
      const result = await serviceProxy.findLeadMessageDetails(
          undefined,
          '',
          JSON.stringify([{
            conversationId: {
              '$in': allLeadConversations.map((leadConversation: LeadConversation) => leadConversation.id),
            },
          }]),
          this.state.pageSize,
          this.state.sortBy,
          undefined,
          after,
      );
      this.setState({
        conversations: [
            ...this.state.conversations,
            ...result.data,
        ],
        before: result.before,
        after: result.after,
        isLoading: false,
      });
    });
  };

  toggleModal = (type: string) => () => {
    this.setState({
      modal: {
          ...this.state.modal,
        [type]: !this.state.modal[type],
      },
    });
  };

  toggleShowing = () => {
    this.setState({
      isShowing: !this.state.isShowing,
    });
  };

  renderAuthor = (item: LeadMessageDetail): string => {
    switch (item.direction) {
      case LEAD_MESSAGE_DETAIL_DIRECTION_IN:
        const author = this.props.users.find((user: User) => {
          return user.id === item.createdBy;
        });
        if (author) return author.fullName;
        break;
      case LEAD_MESSAGE_DETAIL_DIRECTION_OUT:
        return this.getName();
    }
    return 'Admin';
  };

  renderAttachments = (_attaehments: any[]) => {
    return null;
  };

  getName = () => {
    const {data} = this.props;
    if (data && data.contact && data.contact.fullName) return data.contact.fullName;
    if (data && data.contactBasicInfo && data.contactBasicInfo && data.contactBasicInfo.fullName) {
      return data.contactBasicInfo.fullName;
    }
    if (data && data.contact) {
      return data.contact.firstName + ' ' + data.contact.lastName;
    }
    if (data && data.contactBasicInfo) {
      return data.contactBasicInfo.firstName + ' ' + data.contactBasicInfo.lastName;
    }
  };

  renderMessage = (item: LeadMessageDetail) => {
    const {data} = this.props;
    const avatar = data && data.contact && data.contact.avatar;
    return (
      <Comment
          actions={[<Icon type='message' style={{marginRight: '15px'}}/>, `${timeAgo(item.createdAt)}`]}
          author={<a>{this.renderAuthor(item)}</a>}
          avatar={(
              <Avatar
                  src={avatar || undefined}
                  alt={this.getName()}
                  icon={!avatar ? 'user' : undefined}
              />
          )}
          content={(
              <Row>
                <Col xs={23}>
                  <p>{item.content}</p>
                  {this.renderAttachments(item.attachments)}
                </Col>
                <Col xs={1}>
                  <Tooltip placement='left' trigger={'click'} title={() => {
                    return (
                        <div style={{padding: '8px'}}>
                          <div onClick={this.toggleModal('message')}>{translate('lang:replyByChat')}</div>
                        </div>
                    );
                  }}>
                    <Icon type='ellipsis' style={{cursor: 'pointer'}}/>
                  </Tooltip>
                </Col>
              </Row>
          )}
      />
    );
  };

  renderEmail = (item: LeadMessageDetail) => {
    return (
        <EmailMessage
            data={this.props.data}
            item={item}
            onReply={() => {
              this.setState({
                currentLeadMessageDetail: item,
                modal: {
                  ...this.state.modal,
                  email: true,
                },
              });
            }}
            users={this.props.users}>
        </EmailMessage>
    );
  };

  renderConversations = () => {
    const {conversations, isShowing} = this.state;
    if (!isShowing) return null;
    return conversations.map((item: LeadMessageDetail) => {
      let conversation = null;
      switch ((item as any).channel) {
        case LEAD_CONVERSATION_FBCHAT:
          conversation = this.renderMessage(item);
          break;
        case LEAD_CONVERSATION_EMAIL:
          conversation = this.renderEmail(item);
          break;
      }
      return (
        <Col xs={24} key={item.id}>
          {conversation}
        </Col>
      );
    });
  };

  toggleSelectCentreModal = (visible: boolean, data?: any) => {
    this.setState({
      selectCentreData: data ? data : {},
      selectCentreModal: visible,
    });
  };

  toggleSelectOwnerModal = (visible: boolean, data?: any) => {
    if (visible) {
      if (this.checkPermissionAssign()) {
        if (this.props.data.centre && this.props.data.centre._id) {
          this.setState({
            selectOwnerData: data ? data : {},
            selectOwnerModal: visible,
          });
        } else {
          message.error(translate('lang:centreFirst'), 2);
        }
      } else {
        message.error(translate('lang:noPermissionToChangeOwner'));
      }
    } else {
      this.setState({
        selectOwnerData: data ? data : {},
        selectOwnerModal: visible,
      });
    }
  };

  changeSelectCentre = (id: string) => {
    const selectedCentre = this.props.centres.filter((val: any) => val._id === id);
    if (selectedCentre && selectedCentre.length) {
      this.setState({
        selectCentreData: {
          ...this.state.selectCentreData,
          _id: id,
          name: selectedCentre[0].name,
        },
      });
    }
  };

  changeSelectOwner = (id: string) => {
    const selectedOwner = this.props.salesmen.filter((val: any) => val._id === id);
    if (selectedOwner && selectedOwner.length) {
      this.setState({
        selectOwnerData: {
          ...this.state.selectOwnerData,
          ...selectedOwner[0],
        },
      });
    }
  }

  selectCentre = async () => {
    try {
      if (this.state.selectCentreData && this.state.selectCentreData._id && (!this.props.data.centre || (this.state.selectCentreData._id !== this.props.data.centre._id))) {
        this.props.changeInput({
          centre: this.state.selectCentreData,
          owner: null,
        });
        await this.props.updateLead({
          centre: this.state.selectCentreData,
          owner: null,
        });
        this.toggleSelectCentreModal(false);
      } else {
        this.toggleSelectCentreModal(false);
      }
    } catch (error) {
      //
    }
  };

  selectOwner = async () => {
    try {
      if (this.state.selectOwnerData && this.state.selectOwnerData._id) {
        this.props.changeInput({
          owner: this.state.selectOwnerData,
        });
        await this.props.updateLead({
          owner: this.state.selectOwnerData,
        });
        this.toggleSelectOwnerModal(false);
      }
    } catch (error) {
      //
    }
  };

  getRecipients = () => {
    const {data} = this.props;
    if (data && data.contact) {
      return data.contact && data.contact.email ? [data.contact.email] : undefined;
    } else if (data && data.contactBasicInfo) {
      return [data.contactBasicInfo.email];
    }
    return [];
  };

  getSource = () => {
    const {data} = this.props;
    if (data && data.contact) {
      return (
          <span>
            {data.contact._id && data.contact._id.prospectingListId
            && data.contact._id.prospectingListId.source ? getProspectingSourceName(data.contact._id.prospectingListId.source)
            : 'N/A'}
          </span>
      );
    } else {
      return (
          <span>
            {data.prospectingListId
            && data.prospectingListId.source ? getProspectingSourceName(data.prospectingListId.source)
            : 'N/A'}
          </span>
      );
    }
  }

  getProspectingListName = () => {
    const {data} = this.props;
    if (data && data.contact) {
      return (
          <span>
            {
              data.contact._id && data.contact._id.prospectingListId && data.contact._id.prospectingListId.name
            }
          </span>
      );
    } else {
      return (
          <span>
            {
              data.prospectingListId && data.prospectingListId.name
            }
          </span>
      );
    }
  };

  render() {
    const data = this.props.data;
    const {isLoading, after, isShowing, currentLeadMessageDetail} = this.state;
    const leadFbConversation = this.state.allLeadConversations.find((item: any) => item.channel === LEAD_CONVERSATION_FBCHAT);
    const leadEmailConversation = this.state.allLeadConversations.find((item: any) => item.channel === LEAD_CONVERSATION_EMAIL);

    return (
      <BorderWrapper style={{marginTop: '24px'}}>
        <div>
          <h3>{translate('lang:leadManagementTitle')}</h3>
          <Row>
            <Col xs={10}>
              <p style={{cursor: 'pointer'}} onClick={() => this.toggleSelectOwnerModal(true, data.owner)}><span className='text-gray'>
                {translate('lang:owner')}:</span> {data.owner ? <span>{data.owner.fullName}</span> : <span className='text-red'>{translate('lang:notAssignedYet')}</span>}</p>
            </Col>
            <Col xs={12} offset={2}>
              <p style={{cursor: 'pointer'}} onClick={() => this.toggleSelectCentreModal(true, data.centre)}>
                <span className='text-gray' style={{cursor: 'pointer'}}>{translate('lang:centre')}:</span> {data.centre ?
                  <span>{data.centre.name}</span> : <span className='text-red'>{translate('lang:notAssignedYet')}</span>}</p>
            </Col>
            <Col xs={10}>
              <p><span className='text-gray'>{translate('lang:customerStatus')}:</span> Old</p>
            </Col>
            <Col xs={12} offset={2}>
              <p><span className='text-gray'>{translate('lang:inBlacklist')}:</span> No</p>
            </Col>
            <Col xs={10}>
              <p><span className='text-gray'>{translate('lang:fromSource')}: </span> {this.getSource()}</p>
            </Col>
            <Col xs={12} offset={2}>
              <p><span className='text-gray'>{translate('lang:fromProspectingList')}:</span> {this.getProspectingListName()}</p>
            </Col>
            <Col xs={10}>
              <p><span className='text-gray'>{translate('lang:createdAt')}:</span> {moment(data.createdAt).format('DD MMM, HH:mm')}</p>
            </Col>
            <Col xs={12} offset={2}>
              <p><span className='text-gray'>{translate('lang:lastUpdatedAt')}:</span> {data.lastModifiedAt ?
                moment(data.lastModifiedAt).format('DD MMM, HH:mm') : moment(data.createdAt).format('DD MMM, HH:mm')}</p>
            </Col>
          </Row>
        </div>
        <SectionBox>
          <div style={{ padding: '15px 0px 0px 0px' }}>
            <Row>
              <Col xs={12}>
                <h3>{translate('lang:conversations')}</h3>
              </Col>
              <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '50%' }}>
                  <Icon type={isShowing ? 'up-square' : 'down-square'} style={{ color: '#aaa', fontSize: '18px', cursor: 'pointer' }} onClick={this.toggleShowing}/>
                </div>
              </Col>
              {
                this.renderConversations()
              }
              <Col xs={24}>
                {
                  isLoading && (
                      <div style={{height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><Spin /></div>
                  )
                }
              </Col>
            </Row>
          </div>
        </SectionBox>
        {
          after && isShowing && (
              <SectionBox>
                <div
                    onClick={this.handleSearch}
                    style={{padding: '15px', color: 'blue', textAlign: 'center', cursor: 'pointer'}}>
                  {translate('lang:showMoreConvo')}
                </div>
              </SectionBox>
          )
        }
        {
          this.state.modal.message && (
            // @ts-ignore
            <MessageModal
                leadFbConversation={leadFbConversation}
                visible={this.state.modal.message}
                closeModal={this.toggleModal('message')}
            />
          )
        }
        {
          this.state.modal.email && (
              // @ts-ignore
              <MailModal
                  subject={currentLeadMessageDetail && currentLeadMessageDetail.content}
                  messageId={currentLeadMessageDetail && (currentLeadMessageDetail as any).emailMessageId}
                  recipients={this.getRecipients()}
                  leadConversationIds={leadEmailConversation ? [(leadEmailConversation as any).id] : undefined}
                  visible={this.state.modal.email}
                  onCancel={() => {
                    this.setState({
                      currentLeadMessageDetail: undefined,
                      modal: {
                          ...this.state.modal,
                        email: false,
                      },
                    });
                  }}
              />
          )
        }
        <Modal title={translate('lang:selectCentre')} visible={this.state.selectCentreModal} onOk={this.selectCentre} onCancel={() => this.toggleSelectCentreModal(false)}>
          <Row type='flex'>
            <Col xs={24} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{width: '100%'}}>
                <h4>{translate('lang:centre')}</h4>
                <Select style={{ width: '100%' }} value={this.state.selectCentreData._id}
                  onChange={(value: any) => this.changeSelectCentre(value)}>
                  {this.props.centres.filter((val: any) => {
                    return this.checkPermissionCentre() ? true : ((val._id === this.state.selectCentreData._id || val._id === this.props.authUser.centreId) ? true : false);
                  }).map((val: any) => {
                    return <Select.Option value={val._id} key={val._id}>{val.name}</Select.Option>;
                  })}
                </Select>
              </div>
            </Col>
          </Row>
        </Modal>
        <Modal title={translate('lang:selectOwner')} visible={this.state.selectOwnerModal} onOk={this.selectOwner} onCancel={() => this.toggleSelectOwnerModal(false)}>
          <Row type='flex'>
            <Col xs={24} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{width: '100%'}}>
                <h4>{translate('lang:owner')}</h4>
                <Select style={{ width: '100%' }} value={this.state.selectOwnerData._id || this.state.selectOwnerData.id}
                  onChange={(value: any) => this.changeSelectOwner(value)}>
                  {this.props.data && this.props.data.centre && this.props.data.centre._id ?
                    this.props.salesmen.filter((val: any) => val.centreId === this.props.data.centre._id).map((val: any) => {
                      return <Select.Option value={val._id} key={val._id}>{val.fullName}</Select.Option>;
                    }) : <Select.Option value='none' key='none' disabled>{translate('lang:centreFirst')}</Select.Option>
                  }
                </Select>
              </div>
            </Col>
          </Row>
        </Modal>
      </BorderWrapper>
    );
  }
}
