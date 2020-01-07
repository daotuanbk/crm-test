import React from 'react';
import './CampaignScreen.less';
import { Dropdown, Icon, Menu, Col, Row, Spin, Popconfirm } from 'antd';
import { Toolbar, TableList } from '@client/components';
import { getProspectingSourceName } from '@client/core/helpers/getProspectingSourceName';
import { translate } from '@client/i18n';

interface State {
  selectedRowKeys: any;
}

interface Props {
  data: any;
  openModal: any;
  loading: boolean;
  handleSearch?: (data?: any) => void;
  sources: any[];
  onDelete: (id: string) => void;
}

export class Main extends React.Component<Props, State> {
  state: State = {
    selectedRowKeys: [],
  };

  changeSelectedRowKeys = (selectedRowKeys: any) => {
    this.setState({
      selectedRowKeys,
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
    const actionsDropdown = (_record: any) => (
      <Menu>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => {
            this.props.openModal(_record);
          }}>{translate('lang:edit')}</a>
        </Menu.Item>
        <Menu.Item>
          <Popconfirm placement='bottom' title={translate('lang:campaignConfirmDelete')} onConfirm={() => this.props.onDelete(_record._id)}
            okText='Yes' cancelText='No'>
            <a rel='noopener noreferrer'>{translate('lang:delete')}</a>
          </Popconfirm>
        </Menu.Item>
      </Menu>
    );
    const campaignColumns = [{
      title: translate('lang:source'),
      key: 'sourceId',
      dataIndex: 'sourceId',
      render: (sourceId: number, _record: any) => {
        return getProspectingSourceName(sourceId);
      },
    }, {
      title: translate('lang:name'),
      key: 'name',
      dataIndex: 'name',
    }, {
      title: translate('lang:order'),
      key: 'order',
      dataIndex: 'order',
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
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.changeSelectedRowKeys,
    };
    return (
      <Col xs={24}>
        <TableList columns={campaignColumns} dataSource={this.props.data} rowSelection={rowSelection} loading={this.props.loading} />
      </Col>
    );
  }
  render() {
    const sortData = [{
      value: 'createdAt|des',
      label: 'Created at (Descending)',
    }, {
      value: 'createdAt|asc',
      label: 'Created at (Ascending)',
    }, {
      value: 'name|asc',
      label: 'Name (Ascending)',
    }, {
      value: 'name|desc',
      label: 'Name (Descending)',
    }, {
      value: 'order|asc',
      label: 'Order (Ascending)',
    }, {
      value: 'order|des',
      label: 'Order (Descending)',
    }];
    return (
      <div>
        <Row type='flex' style={{ marginBottom: '24px' }} justify='space-between'>
          <Toolbar name='campaigns' data={[]} sortData={sortData} disableFilter={true} callback={this.props.handleSearch} />
        </Row>
        <Row type='flex'>
          {
            this.renderTable()
          }
        </Row>
      </div>
    );
  }
}
