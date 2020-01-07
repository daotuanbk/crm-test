import React from 'react';
import { BorderWrapper } from '@client/components';
import { Row, Col, Input, Form } from 'antd';
import { validateField } from '@client/core';
import { translate } from '@client/i18n';

interface State {
  //
}
interface Props {
  context: any;
  data: any;
  changeInput: (payload: any) => void;
  validateSchema: any;
}
export class Contact extends React.Component<Props, State> {
  state: State = {
    //
  };

  render () {
    return (
      <div style={{marginTop: '25px'}}>
        <h3>{translate('lang:contact')}</h3>
        <BorderWrapper>
          <Row style={{padding: '20px'}} gutter={20} type='flex'>
            <Col xs={12}>
              <div>
                <Form.Item style={{marginBottom: '0px'}} validateStatus={this.props.context.errors.email ? 'error' : undefined} help={this.props.context.errors.email}>
                  <h4>{translate('lang:email')}</h4>
                  <Input type='text'
                    value={this.props.data.email}
                    onChange={(e) => {
                      this.props.context.setFieldValue('email', e.target.value);
                      this.props.changeInput({email: e.target.value});
                    }}
                    onBlur={() => validateField({
                      fieldName: 'email',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            <Col xs={12}>
              <div>
                <Form.Item style={{marginBottom: '0px'}} validateStatus={this.props.context.errors.phone ? 'error' : undefined} help={this.props.context.errors.phone}>
                  <h4>{translate('lang:phone')}</h4>
                  <Input type='text'
                    value={this.props.data.phone}
                    onChange={(e) => {
                      this.props.context.setFieldValue('phone', e.target.value);
                      this.props.changeInput({phone: e.target.value});
                    }}
                    onBlur={() => validateField({
                      fieldName: 'phone',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            <Col xs={24} style={{marginTop: '20px'}}>
              <div>
                <Form.Item style={{marginBottom: '0px'}} validateStatus={this.props.context.errors.fb ? 'error' : undefined} help={this.props.context.errors.fb}>
                  <h4>{translate('lang:fbLink')}</h4>
                  <Input type='text'
                    value={this.props.data.fb}
                    onChange={(e) => {
                      this.props.context.setFieldValue('fb', e.target.value);
                      this.props.changeInput({fb: e.target.value});
                    }}
                    onBlur={() => validateField({
                      fieldName: 'fb',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            <Col xs={24} style={{marginTop: '20px'}}>
              <div>
                <Form.Item style={{marginBottom: '0px'}} validateStatus={this.props.context.errors.address ? 'error' : undefined} help={this.props.context.errors.address}>
                  <h4>{translate('lang:address')}</h4>
                  <Input type='text'
                    value={this.props.data.address}
                    onChange={(e) => {
                      this.props.context.setFieldValue('address', e.target.value);
                      this.props.changeInput({address: e.target.value});
                    }}
                    onBlur={() => validateField({
                      fieldName: 'address',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            {/* <Col xs={12} style={{marginTop: '20px'}}>
              <div>
                <h4>District</h4>
                <Select style={{width: '100%'}} disabled></Select>
              </div>
            </Col>
            <Col xs={12} style={{marginTop: '20px'}}>
              <div>
                <h4>City</h4>
                <Select style={{width: '100%'}} disabled></Select>
              </div>
            </Col> */}
          </Row>
        </BorderWrapper>
      </div>
    );
  }
}
