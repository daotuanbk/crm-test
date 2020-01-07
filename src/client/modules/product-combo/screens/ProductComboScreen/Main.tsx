import React from 'react';
import './ProductComboScreen.less';
import { Dropdown, Icon, Menu, Col, Row, Spin, Popconfirm } from 'antd';
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
  deleteCombo: (payload: string) => Promise<void>;
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
    const actionsDropdown = (_record: any) => (
      <Menu>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => {
            this.props.openModal(_record);
          }}>{translate('lang:edit')}</a>
        </Menu.Item>
        <Menu.Item>
          <Popconfirm title={translate('lang:deleteComboConfirm')} onConfirm={() => this.props.deleteCombo(_record._id)}>
            <a rel='noopener noreferrer'>{translate('lang:delete')}</a>
          </Popconfirm>
        </Menu.Item>
      </Menu>
    );

    const renderCondition = (record: any) => {
      if (record.field && record.field === 'courseCount' && record.condition === 'gt' && record.conditionValue < 0) return 'No condition';
      const field = record.field ? (record.field === 'courseCount' ? 'Number of courses ' : record.field === 'tuitionBD' ? 'Official total tuition fee ' : '') : '';
      if (field) {
        let condition;
        switch (record.condition) {
          case 'lt':
            condition = `${translate('lang:lt')} `;
            break;
          case 'lte':
            condition = `${translate('lang:ltq')} `;
            break;
          case 'gt':
            condition = `${translate('lang:gt')} `;
            break;
          case 'gte':
            condition = `${translate('lang:gte')} `;
            break;
          case 'eq':
            condition = `${translate('lang:eq')} `;
            break;
        }
        if (condition) {
          return field + condition + record.conditionValue;
        } else return '';
      } else return '';
    };

    const productComboColumns = [{
      title: translate('lang:name'),
      key: 'name',
      dataIndex: 'name',
    }, {
      title: translate('lang:condition'),
      key: 'condition',
      dataIndex: 'condition',
      render: (_value: any, record: any) => renderCondition(record),
    }, {
      title: translate('lang:discountType'),
      key: 'discountType',
      dataIndex: 'discountType',
      render: (_value: any, record: any) => {
        if (record.discountType === 'AMOUNT') return <div>{translate('lang:amountOfDiscount')}</div>;
        else if (record.discountType === 'FIXED') return <div>{translate('lang:tuitionFeeAfterDiscount')}</div>;
        else if (record.discountType === 'PERCENT') return <div>{translate('lang:percentOfTuitionFee')}</div>;
        else return <div></div>;
      },
    }, {
      title: translate('lang:discountValue'),
      key: 'discountValue',
      dataIndex: 'discountValue',
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
        <TableList columns={productComboColumns} dataSource={this.props.data} />
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
    }];
    return (
      <div>
        <Row type='flex' style={{ marginBottom: '24px' }} justify='space-between'>
          <Toolbar name={translate('lang:productCombos')} data={[]} sortData={sortData} disableFilter={true} callback={this.props.handleSearch} />
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
