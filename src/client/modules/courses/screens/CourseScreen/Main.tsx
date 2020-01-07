import React from 'react';
import './CourseScreen.less';
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
    //       <a rel='noopener noreferrer' onClick={() => message.success('Delete class')}>Delete</a>
    //     </Menu.Item>
    //   </Menu>
    // );
    const classColumns = [{
      title: translate('lang:name'),
      key: 'name',
      dataIndex: 'name',
      width: '15%',
    }, {
      title: translate('lang:shortName'),
      key: 'shortName',
      dataIndex: 'shortName',
      width: '15%',
    }, {
      title: translate('lang:description'),
      key: 'description',
      dataIndex: 'description',
      width: '30%',
    }, {
      title: translate('lang:tuitionBeforeDiscount'),
      key: 'tuitionBeforeDiscount',
      dataIndex: 'tuitionBeforeDiscount',
      render: (_value: any) => _value ? `${_value.toLocaleString()} VND` : 0,
      width: '25%',
    }];

    return (
      <Col xs={24}>
        <TableList columns={classColumns} dataSource={this.props.data} />
      </Col>
    );
  }
  render() {
    const sortData = [{
      value: 'name|asc',
      label: 'Name (Ascending)',
    }, {
      value: 'name|desc',
      label: 'Name (Descending)',
    }];
    return (
      <div>
        <Row type='flex' style={{ marginBottom: '24px' }} justify='space-between'>
          <Toolbar name={translate('lang:classesToolbar')} data={[]} sortData={sortData} disableFilter={true} callback={this.props.handleSearch} />
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
