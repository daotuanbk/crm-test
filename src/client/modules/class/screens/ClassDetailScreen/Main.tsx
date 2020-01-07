import React from 'react';
import './ClassDetailScreen.less';
import { Col, Row, Spin, message, Button } from 'antd';
import { TableList } from '@client/components';
import { translate } from '@client/i18n';
import { MailModal } from '@client/modules/lead/screens/LeadDetailScreen/components/MailModal';

interface State {
  selectedRowKeys: any;
  modal: boolean;
  currentEmail: any;
}

interface Props {
  data: any;
  loading: boolean;
  handleSearch?: (data?: any) => void;
}

export class Main extends React.Component<Props, State> {
  state: State = {
    selectedRowKeys: [],
    modal: false,
    currentEmail: [],
  };

  changeSelectedRowKeys = (selectedRowKeys: any) => {
    this.setState({
      selectedRowKeys,
    });
    this.setEmail(selectedRowKeys);
  }

  cancelModal = () => {
    this.setState({
      modal: false,
    });
    this.setEmail(this.state.selectedRowKeys);
  }

  setEmail = (keys: any) => {
    const data = this.props.data && this.props.data.students ? this.props.data.students : [];
    this.setState({
      currentEmail: data.filter((val: any) => val.email && keys.indexOf(val._id) >= 0).map((val: any) => val.email),
    });
  }

  sendIndividualEmail = (record: any) => {
    if (record.email) {
      this.setState({
        modal: true,
        currentEmail: [record.email],
      });
    } else {
      message.error(translate('lang:studentHasNoMail'));
    }
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

    const classColumns = [{
      title: translate('lang:name'),
      key: 'name',
      dataIndex: 'name',
      width: '15%',
    }, {
      title: translate('lang:email'),
      key: 'email',
      dataIndex: 'email',
      width: '20%',
    }, {
      title: translate('lang:phone'),
      key: 'phoneNo',
      dataIndex: 'phoneNo',
      width: '15%',
    }, {
      title: translate('lang:fbLink'),
      key: 'fb',
      dataIndex: 'fb',
      render: (_value: any, record: any) => record && record.details && record.details.fbLink ? record.details.fbLink : '',
      width: '15%',
    }, {
      title: translate('lang:address'),
      key: 'address',
      dataIndex: 'address',
      render: (_value: any, record: any) => record && record.details && record.details.address ? record.details.address : '',
      width: '20%',
    }, {
      title: translate('lang:actions'),
      key: 'actions',
      dataIndex: 'actions',
      width: '15%',
      render: (_text: any, record: any) => (
        <a className='ant-dropdown-link' onClick={() => this.sendIndividualEmail(record)}>
          {translate('lang:sendEmail')}
        </a>
      ),
    }];

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.changeSelectedRowKeys,
    };

    return (
      <Col xs={24}>
        <TableList columns={classColumns} dataSource={this.props.data && this.props.data.students ? this.props.data.students : []}
          rowSelection={rowSelection} haveRowSelection={true} noNeedIndex={true} />
      </Col>
    );
  }
  render() {
    return (
      <div>
        <Row type='flex'>
          {
            this.state.selectedRowKeys && this.state.selectedRowKeys.length ? <div style={{ paddingLeft: '5px', paddingBottom: '5px', borderBottom: '1px solid #777', width: '100%' }}>
              <h3 style={{ display: 'inline-block' }}>{translate('lang:actions')}: </h3>
              <Button style={{ marginLeft: '10px' }} onClick={() => this.setState({ modal: true })} type='primary' icon='mail'>{translate('lang:email')}</Button>
            </div> : <div></div>
          }
          {
            this.renderTable()
          }
        </Row>
        <MailModal
          recipients={this.state.currentEmail ? this.state.currentEmail : undefined}
          visible={this.state.modal}
          onCancel={this.cancelModal}
        />
      </div>
    );
  }
}
