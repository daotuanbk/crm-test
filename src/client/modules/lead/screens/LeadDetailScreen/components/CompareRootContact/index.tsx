import React from 'react';
import { Modal, Checkbox, Radio, Row, Col } from 'antd';
import { translate } from '@client/i18n';
import './styles.less';

interface State {}

interface Props {
  visible: boolean;
  options: any;
  values: any;
  onChange: (payload: any) => void;
  onSubmit: () => Promise<void>;
}

export class CompareRootContact extends React.Component<Props, State> {
  render () {
    return this.props.options && this.props.values ? (
      <Modal title={translate('lang:duplicateContacts')} visible={this.props.visible} onOk={this.props.onSubmit} maskClosable={false} cancelText=''>
        <h3>{translate('lang:dataConflicting')}:</h3>
        <Row>
          { this.props.options.email && this.props.options.email.length ?
            <Col xs={24}>
              <h4>{translate('lang:email')}:</h4>
              <Checkbox.Group options={this.props.options.email} value={this.props.values.email} onChange={(data: any) => this.props.onChange({email: data})}>
              </Checkbox.Group>
            </Col> : <div></div>
          }
          {
            this.props.options.phone && this.props.options.phone.length ?
            <Col xs={24}>
              <h4>{translate('lang:phone')}:</h4>
              <Checkbox.Group options={this.props.options.phone || []} value={this.props.values.phone} onChange={(data: any) => this.props.onChange({phone: data})}>
              </Checkbox.Group>
            </Col> : <div></div>
          }
          {
            this.props.options.fb && this.props.options.fb.length ?
            <Col xs={24}>
              <h4>{translate('lang:fb')}:</h4>
              <Checkbox.Group options={this.props.options.fb || []} value={this.props.values.fb} onChange={(data: any) => this.props.onChange({fb: data})}>
              </Checkbox.Group>
            </Col> : <div></div>
          }
          {
            this.props.options.firstName && this.props.options.firstName.length ?
            <Col xs={24}>
              <h4>{translate('lang:firstName')}:</h4>
              <Radio.Group options={this.props.options.firstName || []} value={this.props.values.firstName} onChange={(e) => this.props.onChange({firstName: e.target.value})}>
              </Radio.Group>
            </Col> : <div></div>
          }
          {
            this.props.options.lastName && this.props.options.lastName.length ?
            <Col xs={24}>
              <h4>{translate('lang:lastName')}:</h4>
              <Radio.Group options={this.props.options.lastName || []} value={this.props.values.lastName} onChange={(e) => this.props.onChange({lastName: e.target.value})}>
              </Radio.Group>
            </Col> : <div></div>
          }
          {
            this.props.options.address && this.props.options.address.length ?
            <Col xs={24}>
              <h4>{translate('lang:address')}:</h4>
              <Radio.Group options={this.props.options.address || []} value={this.props.values.address} onChange={(e) => this.props.onChange({address: e.target.value})}>
              </Radio.Group>
            </Col> : <div></div>
          }
        </Row>
      </Modal>
    ) : <div></div>;
  }
}
