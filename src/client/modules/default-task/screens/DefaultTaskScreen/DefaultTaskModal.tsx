import React from 'react';
import { Modal, Form, Row, Input, Icon, InputNumber, Col } from 'antd';
// import * as yup from 'yup';
import { FormikContext, Formik } from 'formik';
// import { validateField } from '../../../../../core';
// import { Role } from '@client/services/service-proxies';
// import { getServiceProxy } from '@client/services';
import { translate } from '@client/i18n';

interface Props {
  title: string;
  visible: boolean;
  handleSubmit: (values: any, formikBag: any) => void;
  closeModal: () => void;
  initialValue?: {
    name?: string;
    address?: string;
  };
  loading: boolean;
}

const addTime = (defaultTask: any): object => {
  const split = defaultTask.schedule && defaultTask.schedule.split('-');
  return {
    ...defaultTask,
    days: split[0],
    hours: split[1],
    minutes: split[2],
  };
};

const toDefaultTask = (defaultTask: any): object => {
  const schedule = defaultTask.days + '-' + defaultTask.hours + '-' + defaultTask.minutes;
  delete defaultTask.days;
  delete defaultTask.hours;
  delete defaultTask.minutes;
  return {
    ...defaultTask,
    schedule,
  };
};

export const DefaultTaskModal = (props: Props) => {
  const initialValue = props.initialValue && ((props.initialValue as any)._id) ? addTime(props.initialValue) : {
    name: '',
    days: 2,
    hours: 0,
    minutes: 0,
  };

  return (
    <Formik
      initialValues={initialValue}
      onSubmit={async (values, formikBag: any) => props.handleSubmit(toDefaultTask(values), formikBag)}
      validateOnChange={false}
    >
      {(context: FormikContext<any>) => (
        <Modal
          title={props.title}
          visible={props.visible}
          onOk={(e) => props.handleSubmit(e, context)}
          onCancel={props.closeModal}
          okButtonProps={{
            onClick: () => context.handleSubmit(),
          }}
          confirmLoading={props.loading}>
          <Form>
            <Row style={{ marginBottom: '10px' }}>
              {translate('lang:name')}:
                        </Row>
            <Row type='flex'>
              <Form.Item style={{ width: '100%' }} validateStatus={context.errors.name ? 'error' : undefined} help={context.errors.name}>
                <Input
                  value={context.values.name}
                  onChange={context.handleChange}
                  prefix={<Icon type='profile' />}
                  placeholder={translate('lang:name')}
                  name='name'
                />
              </Form.Item>
            </Row>
            <Row style={{ marginBottom: '10px' }}>
              {translate('lang:taskCompletedAfter')}:
                        </Row>
            <Row type='flex'>
              <Col xs={8}>
                <Form.Item
                  style={{ marginBottom: 0 }}
                  validateStatus={context.errors.days ? 'error' : undefined} help={context.errors.days}>
                  <InputNumber
                    value={context.values.days}
                    min={0}
                    max={30}
                    onChange={(val: any) => {
                      context.setFieldValue('days', val);
                    }}
                    name='days'
                  /> {translate('lang:days')}
                </Form.Item>
              </Col>
              <Col xs={8}>
                <Form.Item
                  style={{ marginBottom: 0 }}
                  validateStatus={context.errors.hours ? 'error' : undefined} help={context.errors.hours}>
                  <InputNumber
                    value={context.values.hours}
                    min={0}
                    max={23}
                    onChange={(val: any) => {
                      context.setFieldValue('hours', val);
                    }}
                    name='hours'
                  /> {translate('lang:hours')}
                </Form.Item>
              </Col>
              <Col xs={8}>
                <Form.Item
                  style={{ marginBottom: 0 }}
                  validateStatus={context.errors.minutes ? 'error' : undefined} help={context.errors.minutes}>
                  <InputNumber
                    value={context.values.minutes}
                    min={0}
                    max={59}
                    onChange={(val: any) => {
                      context.setFieldValue('minutes', val);
                    }}
                    name='minutes'
                  /> {translate('lang:minutes')}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      )}
    </Formik>
  );
};
