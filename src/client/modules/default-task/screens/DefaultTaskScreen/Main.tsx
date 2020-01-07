import React from 'react';
import { Dropdown, Icon, Menu, Col, Row, message, Spin } from 'antd';
import { Toolbar, TableList } from '@client/components';
import { translate } from '@client/i18n';

interface State {
  search: string;
  data: any;
  before: any;
  after: any;
  sortBy: string;
  pageSize: number;
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
    search: '',
    data: [],
    before: undefined,
    after: undefined,
    sortBy: 'createdAt|desc',
    pageSize: 5,
    selectedRowKeys: [],
  };

  changeSelectedRowKeys = (selectedRowKeys: any) => {
    this.setState({
      selectedRowKeys,
    });
  }

  render() {
    if (this.props.loading) {
      return (
        <div style={{ width: '100%', minHeight: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin /></div>
      );
    }
    const actionsDropdown = (_record: any) => (
      <Menu>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => { this.props.openModal(_record); }}>{translate('lang:edit')}</a>
        </Menu.Item>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => message.success('Delete centre')}>{translate('lang:delete')}</a>
        </Menu.Item>
      </Menu>
    );

    const centreColumns = [{
      title: translate('lang:name'),
      key: 'name',
      dataIndex: 'name',
    }, {
      title: translate('lang:schedule'),
      key: 'schedule',
      dataIndex: 'schedule',
      render: (_text: any) => {
        const split = _text.split('-');
        return split[0] + ' days, ' + split[1] + ' hours, ' + split[2] + ' minutes';
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

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.changeSelectedRowKeys,
    };

    return (
      <div>
        <Row type='flex' style={{ marginBottom: '24px' }} justify='space-between'>
          <Toolbar name={translate('lang:centres')} data={[]} disableFilter={true} callback={this.props.handleSearch} />
        </Row>
        <Row type='flex'>
          <Col xs={24}>
            <TableList columns={centreColumns} dataSource={this.props.data} rowSelection={rowSelection} />
          </Col>
        </Row>
      </div>
    );
  }
}
