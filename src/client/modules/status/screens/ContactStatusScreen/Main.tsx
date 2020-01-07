import React from 'react';
import './ContactStatusScreen.less';
import { Dropdown, Icon, Menu, Col, Row, message, Spin } from 'antd';
import { Toolbar, TableList } from '@client/components';
import { translate } from '@client/i18n';

interface State {
  selectedRowKeys: any;
}

interface Props {
  data: any;
  openModal: any;
  stages: any;
  loading: boolean;
  handleSearch?: (data?: any) => void;
  eventConfigs: any;
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
          <a rel='noopener noreferrer' onClick={() => message.success('Delete contact status')}>Delete</a>
        </Menu.Item>
      </Menu>
    );
    const centreColumns = [{
      title: translate('lang:name'),
      key: 'name',
      dataIndex: 'name',
      width: '10%',
      render: (_value: any, record: any) => {
        return (
          <div>{record && record.value ? record.value.name || 'N/A' : 'N/A'}</div>
        );
      },
    }, {
      title: translate('lang:stage'),
      key: 'stage',
      dataIndex: 'stage',
      width: '10%',
      render: (_value: any, record: any) => {
        const stage = this.props.stages.filter((val: any) => {
          return record && record.value && record.value.stageId && String(val._id) === String(record.value.stageId);
        })[0];
        return stage ? (
          <div>{stage.value.name || 'N/A'}</div>
        ) : 'N/A';
      },
    }, {
      title: translate('lang:shortName'),
      key: 'shortName',
      width: '10%',
      dataIndex: 'shortName',
      render: (_value: any, record: any) => {
        return (
          <div>{record && record.value ? record.value.shortName || 'N/A' : 'N/A'}</div>
        );
      },
    }, {
      title: translate('lang:description'),
      width: '15%',
      key: 'description',
      dataIndex: 'description',
      render: (_value: any, record: any) => {
        return (
          <div>{record && record.value ? record.value.description || 'N/A' : 'N/A'}</div>
        );
      },
    }, {
      title: translate('lang:order'),
      width: '5%',
      key: 'order',
      dataIndex: 'order',
      render: (_value: any, record: any) => {
        return (
          <div>{record && record.value ? record.value.order || 'N/A' : 'N/A'}</div>
        );
      },
    }, {
      title: translate('lang:eventBefore'),
      width: '20%',
      key: 'eventBefore',
      dataIndex: 'eventBefore',
      render: (_value: any, record: any) => {
        return record.value && record.value.eventBefore && record.value.eventBefore.length ?
          record.value.eventBefore.map((val: any) => {
            const event = this.props.eventConfigs.filter((v: any) => v._id === val)[0];
            if (event) {
              return <p>- {event.eventName}</p>;
            } else {
              return <div></div>;
            }
          }) : 'N/A';
      },
    }, {
      title: translate('lang:eventAfter'),
      key: 'eventAfter',
      width: '20%',
      dataIndex: 'eventAfter',
      render: (_value: any, record: any) => {
        return record.value && record.value.eventAfter && record.value.eventAfter.length ?
          record.value.eventAfter.map((val: any) => {
            const event = this.props.eventConfigs.filter((v: any) => v._id === val)[0];
            if (event) {
              return <p>- {event.eventName}</p>;
            } else {
              return <div></div>;
            }
          }) : 'N/A';
      },
    }, {
      title: translate('lang:actions'),
      width: '10%',
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
    const sortData = [] as any;
    return (
      <div>
        <Row type='flex' style={{ marginBottom: '24px' }} justify='space-between'>
          <Toolbar name='contact statuses' data={[]} sortData={sortData} disableFilter={true} callback={this.props.handleSearch} />
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
