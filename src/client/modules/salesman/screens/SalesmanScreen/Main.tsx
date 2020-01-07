import React from 'react';
import './SalesmanScreen.less';
import { Dropdown, Icon, Menu, Col, Row, Spin, Select, Tag } from 'antd';
import { TableList } from '@client/components';
import { Centre, User } from '@client/services/service-proxies';
import { translate } from '@client/i18n';

interface State {
  selectedRowKeys: any;
  centreId: string | undefined;
}

interface Props {
  openModal: any;
  loading: boolean;
  handleSearch?: (data?: any) => void;
  changeStatus?: (id: string, isActive: boolean) => void;
  salesmen: User[];
  centres: Centre[];
  openEditModal: (user: User) => void;
  removeRole: (id: string) => void;
}

export class Main extends React.Component<Props, State> {
  state: State = {
    selectedRowKeys: [],
    centreId: '0',
  };

  changeSelectedRowKeys = (selectedRowKeys: any) => {
    this.setState({
      selectedRowKeys,
    });
  };

  onChangeCentre = (centreId: string) => {
    this.setState({
      centreId,
    });
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
            this.props.openEditModal(record);
          }}>{translate('lang:changeCenter')}</a>
        </Menu.Item>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => {
            this.props.removeRole(record._id);
          }}>{translate('lang:removeSalesmanRole')}</a>
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
      title: translate('lang:centre'),
      key: 'centre',
      dataIndex: 'centre',
      render: (_text: any, _record: User) => {
        const centre = this.props.centres && this.props.centres.find((item: Centre) => {
          return _record.centreId === item._id;
        });
        if (!centre) return null;
        return centre.name;
      },
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
            Actions <Icon type='down' />
          </a>
        </Dropdown>
      ),
    }];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.changeSelectedRowKeys,
    };
    const dataSources = this.props.salesmen.filter((salesman: User) => {
      if (this.state.centreId === '0') return true;
      return ('' + salesman.centreId === this.state.centreId);
    });
    return (
      <Col xs={24}>
        <TableList columns={campaignColumns} dataSource={dataSources} rowSelection={rowSelection} />
      </Col>
    );
  }
  render() {
    return (
      <div>
        <Row style={{ marginBottom: '24px' }}>
          {translate('lang:selectACenter')}: &nbsp;<Select defaultValue='0' style={{ width: 120 }} onChange={this.onChangeCentre}>
            <Select.Option value='0'>{translate('lang:all')}</Select.Option>
            {
              this.props.centres.map((centre: Centre) => {
                return <Select.Option key={centre._id} value={centre._id}>{centre.name}</Select.Option>;
              })
            }
          </Select>
        </Row>
        <Row type='flex' key={this.state.centreId}>
          {
            this.renderTable()
          }
        </Row>
      </div>
    );
  }
}
