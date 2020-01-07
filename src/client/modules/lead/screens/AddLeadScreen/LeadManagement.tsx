import React from 'react';
import { BorderWrapper } from '@client/components';
import { Row, Col, Select, Form } from 'antd';
import { validateField } from '@client/core';
import { translate } from '@client/i18n';

interface State {}

interface Props {
  context: any;
  data: any;
  validateSchema: any;
  centres: any;
  stages: any;
  statuses: any;
  salesmen: any;
  changeInput: (payload: any) => void;
}

export class LeadManagement extends React.Component<Props, State> {
  render() {
    return (
      <div className='wrapper-relation'>
        <h3>{translate('lang:leadManagementTitle')}</h3>
        <BorderWrapper>
          <Row gutter={20} type='flex'>
            <Col xs={12}>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.centre ? 'error' : undefined} help={this.props.context.errors.centre}>
                  <div>{translate('lang:centre')} </div>
                  <Select style={{ width: '100%' }} value={this.props.data.centre}
                    onChange={(value: any) => {
                      this.props.context.setFieldValue('centre', value);
                      this.props.changeInput({ centre: value });
                      this.props.changeInput({ owner: '' });
                    }}
                    onBlur={() => validateField({
                      fieldName: 'centre',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  >
                    {this.props.centres ? this.props.centres.map((val: any) => {
                      return <Select.Option key={val._id} value={val._id}>{val.name}</Select.Option>;
                    }) : undefined}
                  </Select>
                </Form.Item>
              </div>
            </Col>
            <Col xs={12} key={this.props.data.centre}>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.owner ? 'error' : undefined} help={this.props.context.errors.owner}>
                  <div>{translate('lang:owner')}</div>
                  <Select style={{ width: '100%' }} value={this.props.data.owner}
                    onChange={(value: any) => {
                      this.props.context.setFieldValue('owner', value);
                      this.props.changeInput({ owner: value });
                    }}
                    onBlur={() => validateField({
                      fieldName: 'owner',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  >
                    {
                      this.props.salesmen ? this.props.salesmen.map((val: any) => {
                        if (!this.props.data.centre) return null;
                        if (val.centreId === this.props.data.centre) return <Select.Option value={val._id} key={val._id}>{val.fullName}</Select.Option>;
                        return null;
                      }) : undefined
                    }
                  </Select>
                </Form.Item>
              </div>
            </Col>
            <Col xs={24} style={{ marginTop: '20px' }}>
              <div>
                <div>{translate('lang:prospectingList')}</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Select style={{ flex: 1 }}></Select>
                  <p style={{ marginBottom: '0px', marginLeft: '15px' }}>or <a>Add new list</a></p>
                </div>
              </div>
            </Col>
            <Col xs={12} style={{ marginTop: '20px' }}>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.currentStage ? 'error' : undefined} help={this.props.context.errors.currentStage}>
                  <div>{translate('lang:stage')} <span style={{ color: 'red' }}>*</span></div>
                  <Select style={{ width: '100%' }} value={this.props.data.currentStage}
                    onChange={(value: any) => {
                      this.props.context.setFieldValue('currentStage', value);
                      this.props.changeInput({ currentStage: value });
                    }}
                    onBlur={() => validateField({
                      fieldName: 'currentStage',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  >
                    {
                      this.props.stages ? this.props.stages.map((val: any) => {
                        return <Select.Option value={val.value ? val.value.name : ''} key={val._id}>{val.value ? val.value.name : ''}</Select.Option>;
                      }) : undefined
                    }
                  </Select>
                </Form.Item>
              </div>
            </Col>
            <Col xs={12} style={{ marginTop: '20px' }}>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.currentStatus ? 'error' : undefined} help={this.props.context.errors.currentStatus}>
                  <div>{translate('lang:status')} {this.props.data.currentStage === 'New' ? <div></div> : <span style={{ color: 'red' }}>*</span>}</div>
                  <Select style={{ width: '100%' }} value={this.props.data.currentStatus}
                    onChange={(value: any) => {
                      this.props.context.setFieldValue('currentStatus', value);
                      this.props.changeInput({ currentStatus: value });
                    }}
                    onBlur={() => validateField({
                      fieldName: 'currentStatus',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  >
                    {
                      // tslint:disable-next-line
                      this.props.data.currentStage ? this.props.statuses ? this.props.statuses.filter((val: any) => val.value && val.value.stageId === this.props.stages.filter((val: any) => val.value && val.value.name === this.props.data.currentStage)[0]._id).map((val: any) => {
                        return <Select.Option value={val.value ? val.value.name : ''} key={val._id}>{val.value ? val.value.name : ''}</Select.Option>;
                      }) : undefined : <Select.Option value={undefined} disabled key={'disableKey'}>{translate('lang:selectStageFirst')}</Select.Option>
                    }
                  </Select>
                </Form.Item>
              </div>
            </Col>
          </Row>
        </BorderWrapper>
      </div>
    );
  }
}
