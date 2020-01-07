import React from 'react';
import { Dropdown, Icon, Menu, Col, Row, Spin, Modal } from 'antd';
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
  remove: (id: string) => Promise<void>;
  before: any;
  after: any;
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
  };

  showConfirmDelete = (id: string) => {
    const confirm = Modal.confirm;
    confirm({
      title: translate('lang:confirmDeleteTemplate'),
      onOk: () => {
        return this.props.remove(id);
      },
      onCancel: () => {
        //
      },
    });
  }

  renderTable = () => {
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
          <a rel='noopener noreferrer' onClick={() => this.showConfirmDelete(_record._id)}>{translate('lang:delete')}</a>
        </Menu.Item>
      </Menu>
    );

    const centreColumns = [{
      title: translate('lang:name'),
      key: 'name',
      dataIndex: 'name',
    }, {
      title: translate('lang:type'),
      key: 'type',
      dataIndex: 'type',
      render: (text: string) => {
        switch (text) {
          case 'before':
            return <div>Trước khoá học</div>;
            break;
          case 'after':
            return <div>Sau khoá học</div>;
            break;
          case 'promotion':
            return <div>Quảng cáo</div>;
            break;
          default:
            return <div>Khác</div>;
        }
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
      <Col xs={24}>
        <TableList columns={centreColumns} dataSource={this.props.data} rowSelection={rowSelection} />
        {this.props.before || this.props.after
          ?
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
    );
  }

  render() {
    const sortData = [{
      value: 'name|asc',
      label: 'Name (Ascending)',
    }, {
      value: 'name|des',
      label: 'Name (Descending)',
    }, {
      value: 'createdAt|asc',
      label: 'Created at (Ascending)',
    }, {
      value: 'createdAt|des',
      label: 'Created at (Descending)',
    }];

    return (
      <div>
        <Row type='flex' style={{ marginBottom: '24px' }} justify='space-between'>
          <Toolbar name='templates' data={[]} sortData={sortData} disableFilter={true} callback={this.props.handleSearch} />
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
