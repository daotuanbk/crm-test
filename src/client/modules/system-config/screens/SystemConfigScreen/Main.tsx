import React from 'react';
import './SystemConfigScreen.less';
import { Dropdown, Icon, Menu, Col, Row, Spin } from 'antd';
import { Toolbar, TableList } from '@client/components';
import { translate } from '@client/i18n';

interface State {
  selectedRowKeys: any;
}

interface Props {
  data: any;
  openModal: any;
  loading: boolean;
  handleSearch?: (data?: any) => void;
}

export class Main extends React.Component<Props, State> {
  state: State = {
    selectedRowKeys: [],
  };

  changeSelectedRowKeys = (selectedRowKeys: any) => {
    this.setState({
      selectedRowKeys,
    });
  }
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
      </Menu>
    );
    const centreColumns = [{
      title: translate('lang:option'),
      key: 'option',
      dataIndex: 'option',
    }, {
      title: translate('lang:value'),
      key: 'value',
      dataIndex: 'value',
      render: (_text: any, record: any) => (
        JSON.stringify((record.value))
      ),
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
        <TableList columns={centreColumns} dataSource={this.props.data} rowSelection={rowSelection} />
      </Col>
    );
  }
  render() {
    const sortData = [{
      value: 'option|asc',
      label: 'Option (Ascending)',
    }, {
      value: 'option|des',
      label: 'Option (Descending)',
    }];
    return (
      <div className='users-container'>
        <Row type='flex' style={{ marginBottom: '24px' }} justify='space-between'>
          <Toolbar name={translate('lang:configsLw')} data={[]} sortData={sortData} disableFilter={true} callback={this.props.handleSearch} />
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
