import React from 'react';
import './CentreScreen.less';
import { Col, Row, Spin } from 'antd';
import { Toolbar, TableList } from '@client/components';
import { translate } from '@client/i18n';

interface State {
  selectedRowKeys: any;
}

interface Props {
  data: any;
  loading: boolean;
  handleSearch?: (data?: any) => void;
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
    // const actionsDropdown = (_record: any) => (
    //   <Menu>
    //     <Menu.Item>
    //       <a rel='noopener noreferrer' onClick={() => {
    //         this.props.openModal(_record);
    //       }}>Edit</a>
    //     </Menu.Item>
    //     <Menu.Item>
    //       <a rel='noopener noreferrer' onClick={() => message.success('Delete centre')}>Delete</a>
    //     </Menu.Item>
    //   </Menu>
    // );
    const centreColumns = [{
      title: translate('lang:name'),
      key: 'name',
      dataIndex: 'name',
    }, {
      title: translate('lang:shortName'),
      key: 'shortName',
      dataIndex: 'shortName',
    }, {
      title: translate('lang:order'),
      key: 'order',
      dataIndex: 'order',
    }, {
      title: translate('lang:address'),
      key: 'address',
      dataIndex: 'address',
    }];

    return (
      <Col xs={24}>
        <TableList columns={centreColumns} dataSource={this.props.data} />
      </Col>
    );
  };
  render() {
    const sortData = [{
      value: 'order|asc',
      label: 'Order (Ascending)',
    }, {
      value: 'order|des',
      label: 'Order (Descending)',
    }, {
      value: 'name|asc',
      label: 'Name (Ascending)',
    }, {
      value: 'name|des',
      label: 'Name (Descending)',
    }];
    return (
      <div>
        <Row type='flex' style={{ marginBottom: '24px' }} justify='space-between'>
          <Toolbar name='centres' data={[]} sortData={sortData} disableFilter={true} callback={this.props.handleSearch} />
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
