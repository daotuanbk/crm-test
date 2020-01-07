import React from 'react';
import { Dropdown, Icon, Menu, Col, Row, Spin, Tag } from 'antd';
import { TableList } from '@client/components';
import { User } from '@client/services/service-proxies';
import { translate } from '@client/i18n';

interface State {
  selectedRowKeys: any;
}

interface Props {
  openModal: any;
  loading: boolean;
  handleSearch?: (data?: any) => void;
  changeStatus?: (id: string, isActive: boolean) => void;
  interviewers: User[];
  openEditModal: (user: User) => void;
  removeRole: (id: string) => void;
}

export class Main extends React.Component<Props, State> {
  state: State = {
    selectedRowKeys: [],
  };

  renderTable = () => {
    if (this.props.loading) {
      return (
        <div style={{
          width: '100%',
          minHeight: '100px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}><Spin /></div>
      );
    }
    const actionsDropdown = (record: User) => (
      <Menu>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => {
            this.props.removeRole(record._id);
          }}>{translate('lang:removeInterviewerRole')}</a>
        </Menu.Item>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => {
            if (this.props.changeStatus) {
              this.props.changeStatus(record._id, !record.isActive);
            }
          }}>
            {record.isActive ? translate('lang:inactive') : translate('lang:active')}
          </a>
        </Menu.Item>
      </Menu>
    );
    const campaignColumns = [{
      title: translate('lang:fullName'),
      key: 'fullName',
      dataIndex: 'fullName',
    }, {
      title: translate('lang:status'),
      key: 'isActive',
      dataIndex: 'isActive',
      render: (_text: any, record: User) => {
        return <Tag key={record._id} color={record.isActive ? 'green' : 'red'}>{record.isActive ? 'Active' : 'In-Active'}</Tag>;
      },
    }, {
      title: translate('lang:actions'),
      key: 'actions',
      dataIndex: 'actions',
      render: (_text: any, record: any) => (
        <Dropdown overlay={actionsDropdown(record)} trigger={['click']}>
          <a className='ant-dropdown-link'>
            {translate('lang:actions')} <Icon type='down' />
          </a>
        </Dropdown>
      ),
    }];
    return (
      <Col xs={24}>
        <TableList columns={campaignColumns} dataSource={this.props.interviewers} />
      </Col>
    );
  }
  render() {
    return (
      <div>
        <Row type='flex'>
          {
            this.renderTable()
          }
        </Row>
      </div>
    );
  }
}
