import React from 'react';
import './PaymentTransactionScreen.less';
import { Dropdown, Icon, Menu, Col, Row, Spin, Popconfirm } from 'antd';
import { TableList } from '@client/components';
import moment from 'moment';
import { translate } from '@client/i18n';

interface State {
  selectedRowKeys: any;
}

interface Props {
  data: any;
  openModal: any;
  loading: boolean;
  handleSearch?: () => void;
  deleteTransaction: (payload: string) => Promise<void>;
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
          }}>Edit</a>
        </Menu.Item>
        <Menu.Item>
          <Popconfirm title={translate('lang:confirmDeleteTransaction')} onConfirm={() => this.props.deleteTransaction(_record._id)}>
            <a rel='noopener noreferrer'>{translate('lang:delete')}</a>
          </Popconfirm>
        </Menu.Item>
      </Menu>
    );

    const paymentColumns = [{
      title: translate('lang:date'),
      key: 'date',
      dataIndex: 'date',
      render: (_value: any, record: any) => record.isTotal ? <div><b>{translate('lang:total')}</b></div> : <div>{moment(record.createdAt).format('DD MMM YYYY')}</div>,
    }, {
      title: translate('lang:type'),
      key: 'type',
      dataIndex: 'type',
      render: (_value: any, record: any) => record.isTotal ? <div></div> : <div>{record.paymentType}</div>,
    }, {
      title: translate('lang:note'),
      key: 'note',
      dataIndex: 'note',
      render: (_value: any, record: any) => record.isTotal ? <div></div> : <div>{record.note}</div>,
    }, {
      title: translate('lang:amount'),
      key: 'amount',
      dataIndex: 'amount',
      render: (_value: any, record: any) => record.isTotal ? <div style={{ color: 'red' }}>{record.total}</div> : <div>{`${Number(record.amount || 0).toLocaleString()} VND`}</div>,
    }, {
      title: translate('lang:actions'),
      key: 'action',
      dataIndex: 'action',
      render: (_text: any, record: any) => record.isTotal ? <div></div> : (
        <Dropdown overlay={actionsDropdown(record)} trigger={['click']}>
          <a className='ant-dropdown-link'>
            {translate('lang:actions')} <Icon type='down' />
          </a>
        </Dropdown>
      ),
    }];

    const totalPayment = this.props.data.reduce((sum: number, val: any) => {
      return sum + Number(val ? val.amount : 0 || 0);
    }, 0);

    return (
      <Col xs={24}>
        <TableList columns={paymentColumns} dataSource={[...this.props.data, {
          isTotal: true,
          total: `${Number(totalPayment || 0).toLocaleString()} VND`,
        }]} rowSelection={null} />
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
