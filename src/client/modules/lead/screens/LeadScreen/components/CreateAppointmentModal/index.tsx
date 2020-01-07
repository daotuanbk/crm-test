import React from 'react';
import { Row, Col, Modal, Input, DatePicker, Form, TimePicker, Select, notification } from 'antd';
import { Formik, FormikContext } from 'formik';
import moment, { Moment } from 'moment';
import * as yup from 'yup';
import { LeadAppointment as LeadAppointmentSchema, Centre, Lead } from '@client/services/service-proxies';
import { translate } from '@client/i18n';
import './styles.less';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { getErrorMessage } from '@client/core';

interface LeadAppointment extends LeadAppointmentSchema {
  day: Moment;
  hour: Moment;
}

interface State {
  loading: boolean;
}

interface Props {
  leadInfo: Lead;
  centres: Centre[];
  visible: boolean;
  closeModal: () => void;
  changeInput: (payload: any, callback?: () => void) => void;

}

const toAppointment = (appointment: LeadAppointment): object => {
  return {
    ...appointment,
    hour: undefined,
    day: undefined,
    time: moment([appointment.day.year(), appointment.day.month(), appointment.day.date(), appointment.hour.hour(), appointment.hour.minute(), appointment.hour.second()]).toISOString(),
  };
};

export class CreateAppointmentModal extends React.Component<Props, State> {
  state: State = {
    loading: false,
  };

  handleSubmit = async (values: any, formikBag: any) => {
    try {
      this.setState({
        loading: true,
      });

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const newLeadInfo = await serviceProxy.addLeadAppointment(this.props.leadInfo._id, values);

      this.props.changeInput(newLeadInfo);
      formikBag.resetForm();
      this.props.closeModal();
      notification.success({
        message: 'Create successfully',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Add lead appointment failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const initialValue = {
      title: '',
      centreId: undefined,
      day: moment(new Date()).add(1, 'days'),
      hour: moment(new Date()),
    };

    const editValidationSchema = yup.object().shape({
      title: yup.string().required('Please input title'),
      centreId: yup.string().required('Please select centre'),
      day: yup.object().required('Please select date'),
      hour: yup.object().required('Please select time'),
    });

    return (
      <Formik
        initialValues={initialValue}
        onSubmit={async (values, formikBag: any) => this.handleSubmit(toAppointment(values), formikBag)}
        validationSchema={editValidationSchema}
        validate={(values: any) => {
          const errors = {};

          if (!values.day || !values.hour) {
            (errors as any).day = translate('lang:validateDueAtRequired');
          }

          return errors;
        }}
        validateOnChange={false}
      >
        {(context: FormikContext<any>) => (
          <Modal
            title='Add appointment'
            visible={this.props.visible}
            onCancel={this.props.closeModal}
            confirmLoading={this.state.loading}
            onOk={() => context.handleSubmit()}
          >
            <Form>
              <Row type='flex' gutter={12}>
                <Col xs={24}>
                  {translate('lang:appointmentName')} <span style={{ color: 'red' }}>*</span><br />
                  <Form.Item validateStatus={context.errors.title ? 'error' : undefined} help={context.errors.title}>
                    <Input
                      value={context.values.title}
                      onChange={context.handleChange}
                      placeholder='Title'
                      name='title'
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  {translate('lang:dueAt')} <span style={{ color: 'red' }}>*</span><br />
                  <Form.Item validateStatus={context.errors.day ? 'error' : undefined} help={context.errors.day}>
                    <div style={{ display: 'flex' }}>
                      <DatePicker
                        value={context.values.day}
                        disabledDate={(endValue: any) => {
                          return endValue.valueOf() < moment().valueOf() - 3600000 * 24;
                        }}
                        style={{ marginRight: '10px' }}
                        format={'DD-MM-YYYY'}
                        onChange={(_date) => {
                          context.setFieldValue('day', _date);
                        }}
                        placeholder={translate('lang:selectDay')} />
                      <TimePicker
                        value={context.values.hour}
                        placeholder={translate('lang:selectTime')}
                        format={'HH:mm'}
                        onChange={(_time) => {
                          context.setFieldValue('hour', _time);
                        }} />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  {translate('lang:centre')} <span style={{ color: 'red' }}>*</span><br />
                  <Form.Item validateStatus={context.errors.centreId ? 'error' : undefined} help={context.errors.centreId}>
                    <Select
                      style={{ width: '100%' }}
                      value={context.values.centreId}
                      placeholder='Select centre'
                      onChange={(value: string) => context.setFieldValue('centreId', value)}
                    >
                      {this.props.centres.map((item) => (
                        <Select.Option value={item._id}>{item.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        )}
      </Formik>
    );
  }
}
