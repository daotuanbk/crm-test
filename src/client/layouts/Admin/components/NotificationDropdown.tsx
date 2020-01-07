import React from 'react';
import { Avatar, Spin, Icon, Popover, message } from 'antd';
import 'firebase/auth';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { LeadNotification } from '@client/services/service-proxies';
import './MessageDropdown.less';
import Router from 'next/router';
import { LEAD_NOTIFICATION_TYPE_EMAIL, LEAD_NOTIFICATION_TYPE_FBMESSAGE } from '@client/core';
import { initStore, withRematch, AuthUser } from '@client/store';
import { translate } from '@client/i18n';
import { PERMISSIONS } from '@common/permissions';
import moment from 'moment';

interface Props {
  mode: 'dropdown' | 'normalList';
  authUser: AuthUser;
}
interface State {
  data: LeadNotification[];
  after: any;
  sortBy: string;
  pageSize: number;
  isLoading: boolean;
  count?: number;
}

class Notification extends React.Component<Props, State> {
  dropdownList: any;
  count: number;
  ownerId?: string;
  static defaultProps = {
    mode: 'dropdown',
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      after: undefined,
      sortBy: 'createdAt|des',
      pageSize: 20,
      isLoading: true,
      count: undefined,
    };
    this.count = 0;
  }

  setOwnerId = (_roles: any[]) => {
    if (this.props.authUser && this.props.authUser.permissions && this.props.authUser.permissions.indexOf(PERMISSIONS.LEAD_NOTIFICATIONS.VIEW_ALL_NOTIFICATIONS) >= 0) {
      this.ownerId = undefined;
    } else {
      this.ownerId = this.props.authUser.id;
    }
  };

  async componentDidMount() {
    this.registerScroll();
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const roles = await serviceProxy.getAllRoles();
    this.setOwnerId(roles && roles.roles);
    try {
      const filters = [{
        objectType:
          {
            $in: ['LeadAppointment', 'LeadTask'],
          },
      }] as any;
      if (this.ownerId) {
        filters.push({
          ownerId: this.ownerId,
        });
      }
      const count = await serviceProxy.findLeadNotifications(
        'countUnseen',
        undefined,
        undefined,
        JSON.stringify(filters),
        undefined,
        undefined,
        undefined,
        undefined,
      ) as any;
      this.count = count;
      const notifications = await serviceProxy.findLeadNotifications(
        undefined,
        undefined,
        undefined,
        JSON.stringify(filters),
        this.state.pageSize,
        this.state.sortBy,
        undefined,
        this.state.after,
      );
      this.setState({
        after: notifications.after,
        data: notifications.data,
        isLoading: false,
        count,
      });
    } catch (e) {
      // console.log(e);
    }
  }

  registerScroll = () => {
    const { mode } = this.props;
    if (mode === 'dropdown') {
      if (this.dropdownList) {
        this.dropdownList.addEventListener('scroll', () => {
          if (this.dropdownList.scrollTop + this.dropdownList.clientHeight >= this.dropdownList.scrollHeight - 50) {
            if (!this.state.after) return;
            this.handleSearch();
          }
        });
      }
    }
    else if (mode === 'normalList') {
      // @ts-ignore
      window.onscroll = (ev: any) => {
        if ((document.body.clientHeight + window.scrollY) >= document.body.scrollHeight - 50) {
          if (!this.state.after) return;
          this.handleSearch();
        }
      };
    }
  };

  handleSearch = async () => {
    const { isLoading, after } = this.state;
    if (isLoading) return;

    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const filters = [{
      objectType:
        {
          $in: ['LeadAppointment', 'LeadTask'],
        },
    }] as any;
    if (this.ownerId) {
      filters.push({
        ownerId: this.ownerId,
      });
    }
    this.setState({
      isLoading: true,
    }, async () => {
      const notifications = await serviceProxy.findLeadNotifications(
        undefined,
        '',
        '',
        JSON.stringify(filters),
        this.state.pageSize,
        this.state.sortBy,
        undefined,
        after,
      );
      this.setState({
        data: [
          ...this.state.data,
          ...notifications.data,
        ],
        after: notifications.after,
        isLoading: false,
      });
    });
  };

  onClickNotification = async (item: LeadNotification) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    if (!item.isChecked) {
      serviceProxy.updateLeadNotification(item.id, {
        operation: 'check',
      });
    }

    if (item.leadId && (item.leadId as any)._id) {
      Router.push(`/lead-detail/${(item.leadId as any)._id}`);
    } else if (item.contactId && (item.contactId as any)._id) {
      Router.push(`/contact-detail/${(item.contactId as any)._id}`);
    }
  };

  onClickDropdown = async () => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const isNotSeen = this.state.data.filter((item: LeadNotification) => {
      return !item.isSeen;
    });
    const ids = isNotSeen.map((item: LeadNotification) => item.id);
    await serviceProxy.updateLeadNotification('null', {
      operation: 'seen',
      payload: {
        ids,
      },
    });
    this.setState({
      count: undefined,
    });
  };

  markAllAsSeen = async () => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      await serviceProxy.updateLeadNotification('null', {
        operation: 'markAllAsSeen',
        payload: {
          ownerId: this.ownerId,
        },
      });
      this.setState({
        count: undefined,
      });
      message.success(translate('lang:updateSuccess'), 4);
    } catch (e) {
      //
    }
  }

  renderNotificationType = (type: number) => {
    switch (type) {
      case LEAD_NOTIFICATION_TYPE_EMAIL:
        return <Icon type='mail' />;
      case LEAD_NOTIFICATION_TYPE_FBMESSAGE:
        return <Icon type='message' />;
    }
    return null;
  };

  renderItem = (item: LeadNotification) => {
    return (
      <div
        key={item.id}
        onClick={() => {
          this.onClickNotification(item);
        }}
        className={`notification-dropdown-item ${item.isChecked ? 'is-checked' : ''}`}>
        <div className='item-inner'>
          <Avatar size='large' icon='user' style={{ marginRight: '10px', flex: 'none' }} />
          <div>
            <div>
              <span><strong>{item.leadId && (item.leadId as any).contact.fullName ||
                item.contactId && (item.contactId as any).contactBasicInfo && (item.contactId as any).contactBasicInfo.fullName}</strong> {item.content}</span>
            </div>
            <div>
              {this.renderNotificationType(item.type)} {moment((item as any).objectId && (item.objectId as any).dueAt).format('DD MMM YYYY, HH:mm')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderNotifications = () => {
    const { data, isLoading } = this.state;
    const { mode } = this.props;

    if (!data.length) {
      return <div style={{ textAlign: 'center', padding: '15px' }}>No notifications</div>;
    }

    const menu = (
      <div className='dropdownMenu'>
        <div className={`${mode === 'dropdown' ? 'notification-dropdown-list' : ''}`} ref={(ele: any) => {
          this.dropdownList = ele;
          this.registerScroll();
        }}>
          {
            this.count && (
              <React.Fragment>
                <div style={{ backgroundColor: '#ebf6ff', padding: '5px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>New</span>
                  <span style={{ cursor: 'pointer' }} onClick={this.markAllAsSeen}>Mark all as seen</span>
                </div>
                {
                  data.slice(0, this.count).map((item: LeadNotification) => {
                    return this.renderItem(item);
                  })
                }
                <div style={{ backgroundColor: '#ebf6ff', borderTop: '1px solid #ececec', marginTop: '5px', padding: '5px' }}>Earlier</div>
              </React.Fragment>
            )
          }
          {
            data.slice(this.count).map((item: LeadNotification) => {
              return this.renderItem(item);
            })
          }
        </div>
        {
          isLoading && (
            <div style={{ height: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin /></div>
          )
        }
        {
          mode === 'dropdown' && (
            <div className='see-all-notifications-btn'>
              <div style={{ textAlign: 'center' }} onClick={() => {
                Router.push(`/noti-task`);
              }}>See all</div>
            </div>
          )
        }
      </div>
    );
    return menu;
  };

  render() {
    const { count } = this.state;
    const { mode } = this.props;

    if (mode === 'dropdown') {
      return (
        <Popover overlayClassName={'notification-dropdown-bell-popover'} placement='bottom' content={this.renderNotifications()} trigger='click'>
          <span className={`action notification-dropdown-bell`}
            onClick={() => {
              this.onClickDropdown();
            }}
            style={{ width: '70px' }}>
            <img src='/static/images/icon-bell.png' width='100%' />
            {
              count ? <span className='notification-dropdown-bell-number'>{count}</span> : null
            }
          </span>
        </Popover>
      );
    }

    if (mode === 'normalList') {
      return <div className={'notification-normal-list'}>
        {
          this.renderNotifications()
        }
      </div>;
    }

    return null;
  }
}

const mapState = (rootState: any) => {
  return {
    authUser: rootState.profileModel.authUser,
  };
};

const mapDispatch = (_rootReducer: any) => {
  return {};
};

const NotificationDropdown = withRematch(initStore, mapState, mapDispatch)(Notification);

export {
  NotificationDropdown,
};
