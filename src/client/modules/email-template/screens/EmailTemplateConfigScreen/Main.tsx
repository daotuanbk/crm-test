import React from 'react';
import { Dropdown, Icon, Menu, Col, Row, Spin } from 'antd';
import { Toolbar, TableList, Pagination } from '@client/components';
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
  before: any;
  after: any;
  templates: any;
  loadPreviousPage: () => Promise<any>;
  loadNextPage: () => Promise<any>;
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
      </Menu>
    );

    const configColumns = [{
      title: translate('lang:eventName'),
      key: 'eventName',
      dataIndex: 'eventName',
      width: '20%',
    }, {
      title: translate('lang:configs'),
      key: 'configs',
      dataIndex: 'configs',
      render: (_value: any, record: any) => {
        return <div>{record && record.data && record.data.length ? record.data.map((val: any) => {
          const template = this.props.templates.filter((v: any) => v._id === val.template);
          return val.recipient && template && template.length && val.subject ? <div>{`- ${translate('lang:to')} ${val.recipient} | ${translate('lang:template')} : ${template[0].name}` || ''}</div> :
            translate('lang:noTemplate');
        }) : ''}</div>;
      },
      width: '70%',
    }, {
      title: translate('lang:actions'),
      key: 'actions',
      dataIndex: 'actions',
      width: '10%',
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
          <Toolbar name={translate('lang:configs')} data={[]} disableFilter={true} callback={this.props.handleSearch} />
        </Row>
        <Row type='flex'>
          <Col xs={24}>
            <TableList columns={configColumns} dataSource={this.props.data} rowSelection={rowSelection} />
            {this.props.before || this.props.after ?
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination
                  before={this.props.before}
                  after={this.props.after}
                  loadPreviousPage={this.props.loadPreviousPage}
                  loadNextPage={this.props.loadNextPage}
                />
              </div>
              : null}
          </Col>
        </Row>
      </div>
    );
  }
}
