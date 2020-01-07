import React from 'react';
import { BorderWrapper } from '@client/components';
import { Row, Col, Input, Form, DatePicker } from 'antd';
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
export class Relation extends React.Component<Props, State> {
  state: State = {
    //
  };

  render() {
    return (
      <div className='wrapper-relation'>
        <h3>{this.props.data.userType === 'parent' ? 'Student' : 'Parent'}</h3>
        <BorderWrapper>
          <Row gutter={20} type='flex'>
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.relationName ? 'error' : undefined} help={this.props.context.errors.relationName}>
                  <div>{translate('lang:name')}</div>
                  <Input type='text'
                    value={this.props.data.relationName}
                    onChange={(e) => {
                      this.props.context.setFieldValue('relationName', e.target.value);
                      this.props.changeInput({ relationName: e.target.value });
                    }}
                    onBlur={() => validateField({
                      fieldName: 'relationName',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.relationType ? 'error' : undefined} help={this.props.context.errors.relationType}>
                  <div>{translate('lang:relation')}</div>
                  <Input type='text'
                    value={this.props.data.relationType}
                    onChange={(e) => {
                      this.props.context.setFieldValue('relationType', e.target.value);
                      this.props.changeInput({ relationType: e.target.value });
                    }}
                    onBlur={() => validateField({
                      fieldName: 'relationType',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.relationEmail ? 'error' : undefined} help={this.props.context.errors.relationEmail}>
                  <div>{translate('lang:email')}</div>
                  <Input type='text'
                    value={this.props.data.relationEmail}
                    onChange={(e) => {
                      this.props.context.setFieldValue('relationEmail', e.target.value);
                      this.props.changeInput({ relationEmail: e.target.value });
                    }}
                    onBlur={() => validateField({
                      fieldName: 'relationEmail',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.relationPhone ? 'error' : undefined} help={this.props.context.errors.relationPhone}>
                  <div>{translate('lang:phone')}</div>
                  <Input type='text'
                    value={this.props.data.relationPhone}
                    onChange={(e) => {
                      this.props.context.setFieldValue('relationPhone', e.target.value);
                      this.props.changeInput({ relationPhone: e.target.value });
                    }}
                    onBlur={() => validateField({
                      fieldName: 'relationPhone',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            {
              this.props.data.userType === 'parent' ?
                <div style={{ width: '100%' }}>
                  <Col xs={12} className='default-margin'>
                    <div>
                      <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.schoolName ? 'error' : undefined} help={this.props.context.errors.schoolName}>
                        <div>{translate('lang:schooName')}</div>
                        <Input type='text' value={this.props.data.schoolName} onChange={(e) => {
                          this.props.context.setFieldValue('schoolName', e.target.value);
                          this.props.changeInput({ schoolName: e.target.value });
                        }}
                          onBlur={() => validateField({
                            fieldName: 'schoolName',
                            validateSchema: this.props.validateSchema,
                            context: this.props.context,
                          })}
                        ></Input>
                      </Form.Item>
                    </div>
                  </Col>
                  <Col xs={12} className='default-margin'>
                    <div>
                      <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.majorGrade ? 'error' : undefined} help={this.props.context.errors.majorGrade}>
                        <div>{translate('lang:grade')}</div>
                        <Input type='text' value={this.props.data.majorGrade} onChange={(e) => {
                          this.props.context.setFieldValue('majorGrade', e.target.value);
                          this.props.changeInput({ majorGrade: e.target.value });
                        }}
                          onBlur={() => validateField({
                            fieldName: 'majorGrade',
                            validateSchema: this.props.validateSchema,
                            context: this.props.context,
                          })}
                        ></Input>
                      </Form.Item>
                    </div>
                  </Col>
                </div> : <div></div>
            }
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.relationDob ? 'error' : undefined} help={this.props.context.errors.relationDob}>
                  <div>{translate('lang:dateOfBirth')}</div>
                  <DatePicker style={{ width: '100%' }} onChange={(date) => {
                    this.props.context.setFieldValue('relationDob', date);
                    this.props.changeInput({ relationDob: date });
                  }} />
                </Form.Item>
              </div>
            </Col>
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.relationSocial ? 'error' : undefined} help={this.props.context.errors.relationSocial}>
                  <div>{translate('lang:zalo/Fb')}</div>
                  <Input type='text' value={this.props.data.relationSocial} onChange={(e) => {
                    this.props.context.setFieldValue('relationSocial', e.target.value);
                    this.props.changeInput({ relationSocial: e.target.value });
                  }}
                    onBlur={() => validateField({
                      fieldName: 'relationSocial',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            {
              this.props.data.userType === 'student' ?
                <Col xs={12}>
                  <div>
                    <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.relationJob ? 'error' : undefined} help={this.props.context.errors.relationJob}>
                      <div>{translate('lang:job')}</div>
                      <Input type='text' value={this.props.data.relationJob} onChange={(e) => {
                        this.props.context.setFieldValue('relationJob', e.target.value);
                        this.props.changeInput({ relationJob: e.target.value });
                      }}
                        onBlur={() => validateField({
                          fieldName: 'relationJob',
                          validateSchema: this.props.validateSchema,
                          context: this.props.context,
                        })}
                      ></Input>
                    </Form.Item>
                  </div>
                </Col> : <div></div>
            }
          </Row>
        </BorderWrapper>
      </div>
    );
  }
}
