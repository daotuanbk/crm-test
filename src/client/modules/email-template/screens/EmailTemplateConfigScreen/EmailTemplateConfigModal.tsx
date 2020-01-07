import React from 'react';
import { Modal, Form, Row, Input, Select, Col, Icon } from 'antd';
import { translate } from '@client/i18n';

interface Props {
  title: string;
  visible: boolean;
  handleSubmit: () => void;
  closeModal: () => void;
  initialValue?: {
    name?: string;
    address?: string;
  };
  loading: boolean;
  templates: any;
  data: any;
  addRecipient: any;
  changeRecipient: any;
  removeRecipient: any;
  changeData: any;
}

export const EmailTemplateConfigModal = (props: Props) => {
  return (
    <Modal
      width='900px'
      maskClosable={false}
      style={{ width: '900px' }}
      title={props.title}
      visible={props.visible}
      onOk={() => props.handleSubmit()}
      onCancel={props.closeModal}
      confirmLoading={props.loading}>
      <Form>
        <Row>
          <h3>{translate('lang:eventName')}: <span style={{ color: 'red' }}>*</span></h3>
        </Row>
        <Row type='flex'>
          <Form.Item style={{ width: '100%' }}>
            <Input
              value={props.data.eventName}
              onChange={(e) => props.changeData({ eventName: e.target.value })}
              placeholder={translate('lang:eventName')}
            />
          </Form.Item>
        </Row>
        <Row>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <Col xs={12} style={{ display: 'flex', alignItems: 'center' }}>
              <h3 style={{ marginBottom: '0px' }}>{translate('lang:data')}:</h3>
            </Col>
            <Col xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <a onClick={props.addRecipient}>{translate('lang:addRecipient')}</a>
            </Col>
          </div>
          {props.data.data ? props.data.data.map((val: any) => {
            return <Row className='config-data-section'>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <Col xs={12} style={{ display: 'flex', alignItems: 'center' }}>
                    <h4>{translate('lang:recipient')} <span style={{ color: 'red' }}>*</span></h4>
                  </Col>
                  <Col xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Icon type='delete' style={{ fontSize: '22px', cursor: 'pointer', color: '#1890ff' }} onClick={() => props.removeRecipient(val.index)}></Icon>
                  </Col>
                </div>
                <Form.Item style={{ width: '100%' }}>
                  <Select
                    value={val.recipient}
                    placeholder='Recipient'
                    onChange={(value) => props.changeRecipient({
                      index: val.index,
                      recipient: value,
                    })}
                  >
                    <Select.Option value='student' key='student'>{translate('lang:student')}</Select.Option>
                    <Select.Option value='saleman' key='saleman'>{translate('lang:saleman')}</Select.Option>
                    <Select.Option value='admin' key='admin'>{translate('lang:admin')}</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div>
                <h4>{translate('lang:template')}:</h4>
                <Form.Item style={{ width: '100%' }}>
                  <Select
                    value={val.template ? val.template : ''}
                    placeholder={translate('lang:template')}
                    onChange={(value) => props.changeRecipient({
                      index: val.index,
                      template: value,
                    })}
                  >
                    <Select.Option value='' key={'No Template'}>{translate('lang:noTemplate')}</Select.Option>
                    {
                      props.templates.map((v: any) => {
                        return <Select.Option value={v._id} key={v._id}>{v.name}</Select.Option>;
                      })
                    }
                  </Select>
                </Form.Item>
              </div>
            </Row>;
          }) : <div></div>}
        </Row>
      </Form>
    </Modal>
  );
};
