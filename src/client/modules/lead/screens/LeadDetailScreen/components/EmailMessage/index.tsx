import React from 'react';
import { Row, Col, Icon, Avatar, Comment, Tooltip } from 'antd';
import { LeadMessageDetail, User } from '@client/services/service-proxies';
import { LEAD_MESSAGE_DETAIL_DIRECTION_IN, LEAD_MESSAGE_DETAIL_DIRECTION_OUT, timeAgo } from '@client/core';
import './styles.less';

interface State {
  showMore: boolean;
}

interface Props {
  data: any;
  item: LeadMessageDetail;
  users: any[];
  onReply: () => void;
}

export class EmailMessage extends React.Component<Props, State> {
  state: State = {
    showMore: false,
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

  render() {
    const {data, item, onReply} = this.props;
    const avatar = data && data.contact && data.contact.avatar;
    return (
        <Comment
            actions={[<Icon type='mail' style={{marginRight: '15px'}}/>, `${timeAgo(item.createdAt)}`]}
            author={<a>{this.renderAuthor(item)}</a>}
            avatar={(
                <Avatar
                    src={avatar || undefined}
                    alt={data && data.contact && data.contact.fullName}
                    icon={!avatar ? 'user' : undefined}
                />
            )}
            content={(
                <Row>
                  <Col xs={23}>
                    <p style={{cursor: 'pointer'}}>
                      {item.content}
                    </p>
                    {
                      !this.state.showMore
                        ? <div
                            style={{cursor: 'pointer', color: '#0289ff'}}
                            onClick={() => {
                              this.setState({showMore: true});
                            }}>Show more...</div>
                          : <div>
                            <span dangerouslySetInnerHTML={{__html: `${item.html}`}}></span>
                            <div
                              style={{cursor: 'pointer', color: '#0289ff'}}
                              onClick={() => {
                                this.setState({showMore: false});
                              }}>Show less</div>
                          </div>
                    }
                  </Col>
                  <Col xs={1}>
                    {
                      item.direction === LEAD_MESSAGE_DETAIL_DIRECTION_OUT && (
                          <Tooltip placement='left' trigger={'click'} title={() => {
                            return (
                                <div style={{padding: '8px'}}>
                                  <div onClick={() => {
                                    if (onReply) onReply();
                                  }}>Reply by mail</div>
                                </div>
                            );
                          }}>
                            <Icon type='ellipsis' style={{cursor: 'pointer'}}/>
                          </Tooltip>
                      )
                    }
                  </Col>
                </Row>
            )}
        />
    );
  }
}
