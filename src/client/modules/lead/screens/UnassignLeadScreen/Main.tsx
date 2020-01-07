import React from 'react';
import './UnassignLeadScreen';
import { Dropdown, Icon, Menu, Col, Row, message, Popover } from 'antd';
import { Toolbar, TableList, Pagination } from '@client/components';

interface State {
  search: string;
  data: any;
  before: any;
  after: any;
  sortBy: string;
  pageSize: number;
  loading: {
    table: boolean;
    modal: boolean;
  };
  selectedRowKeys: any;
}
interface Props { }
export class Main extends React.Component<Props, State> {
  state: State = {
    search: '',
    data: [],
    before: undefined,
    after: undefined,
    sortBy: 'createdAt|desc',
    pageSize: 5,
    loading: {
      table: false,
      modal: false,
    },
    selectedRowKeys: [],
  };

  async componentDidMount() {
    this.handleSearch('');
  }

  changeSelectedRowKeys = (selectedRowKeys: any) => {
    this.setState({
      selectedRowKeys,
    });
  }

  handleSearch = async (_value: string) => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.response);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  loadPreviousPage = async () => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.response);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  loadNextPage = async () => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.response);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  render() {
    const actionsDropdown = (_record: any) => (
      <Menu>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => message.success('Under development')}>Assign To</a>
        </Menu.Item>
      </Menu>
    );

    const namePopover = (_record: any) => (
      <div>
        <h5><span className='text-gray'>First name:</span> Trung</h5>
        <h5><span className='text-gray'>Last name:</span> Đỗ Thế</h5>
        <h5><span className='text-gray'>Phone:</span> <a className='no-cursor-pointer'>0912345678</a></h5>
        <h5><span className='text-gray'>Email:</span> <a className='no-cursor-pointer'>trung.dt@ftp.vn</a></h5>
        <h5><span className='text-gray'>Facebook:</span> <a className='no-cursor-pointer'>trungfpt</a></h5>
      </div>
    );

    const listPopover = (_record: any) => (
      <div>
        <h5><span className='text-gray'>Source:</span> Facebook</h5>
        <h5><span className='text-gray'>Campaign:</span> Sale</h5>
      </div>
    );

    const poPopover = (_record: any) => (
      <div>
        <h4>Code for everyone</h4>
      </div>
    );

    const leadColumns = [{
      title: "Lead's name",
      key: 'name',
      dataIndex: 'name',
      render: (_value: any, _record: any, _index: number) => <Popover title='' trigger='hover' content={namePopover(_record)}>
        <a href={`/lead-detail/${_record._id}`}>{_value}</a>
      </Popover>,
    }, {
      title: 'Prospecting Lists',
      key: 'prospectingLists',
      dataIndex: 'prospectingLists',
      render: (_value: any, _record: any, _index: number) => <Popover title='' trigger='hover' content={listPopover(_record)}>
        <a href={`/list-detail/${_record._id}`}>{_value}</a>
      </Popover>,
    }, {
      title: 'PO',
      key: 'po',
      dataIndex: 'po',
      render: (_value: any, _record: any, _index: number) => <Popover title='' trigger='hover' content={poPopover(_record)}>
        <div>{_value}</div>
      </Popover>,
    }, {
      title: 'Amount (VND)',
      key: 'amount',
      dataIndex: 'amount',
    }, {
      title: 'Actions',
      key: 'actions',
      width: '7%',
      dataIndex: 'actions',
      render: (_text: any, record: any) => (
        <Dropdown overlay={actionsDropdown(record)} trigger={['click']}>
          <a className='ant-dropdown-link'>
            Actions <Icon type='down' />
          </a>
        </Dropdown>
      ),
    }];
    const data = [];
    for (let i = 0; i < 40; i++) {
      data.push({
        _id: i,
        key: i,
        owner: `Techkids ${i}`,
        name: `Software ${i}`,
        po: 'C4E',
        prospectingLists: "Facebook's data",
        amount: i * 1000000,
        stage: 'New',
        tuition: '0%',
        status: '',
        note: `${i}d`,
      });
    }

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.changeSelectedRowKeys,
    };

    return (
      <div className='unassign-screen'>
        <Row type='flex' style={{ marginBottom: '24px' }} justify='space-between'>
          <Toolbar name='leads' data={[]} />
        </Row>
        <Row type='flex'>
          <Col xs={24}>
            <TableList columns={leadColumns} dataSource={data} rowSelection={rowSelection} />
            {this.state.before || this.state.after ?
              <Pagination before={this.state.before} after={this.state.after} loadPreviousPage={this.loadPreviousPage} loadNextPage={this.loadNextPage} />
              : null
            }
          </Col>
        </Row>
      </div>
    );
  }
}
