import React from 'react';
import { Row, Col, Modal, Input, DatePicker, Form, TimePicker, notification } from 'antd';
import { Formik, FormikContext } from 'formik';
import moment, { Moment } from 'moment';
import * as yup from 'yup';
import { LeadReminder as LeadReminderSchema, Lead } from '@client/services/service-proxies';
import { translate } from '@client/i18n';
import './styles.less';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { getErrorMessage } from '@client/core';

interface LeadReminder extends LeadReminderSchema {
  day: Moment;
  hour: Moment;
}

interface State {
  loading: boolean;
}

interface Props {
  leadInfo: Lead;
  visible: boolean;
  closeModal: () => void;
  changeInput: (payload: any, callback?: () => void) => void;

}

const toReminder = (reminder: LeadReminder): object => {
  return {
    ...reminder,
    dueAt: moment([reminder.day.year(), reminder.day.month(), reminder.day.date(), reminder.hour.hour(), reminder.hour.minute(), reminder.hour.second()]).toISOString(),
  };
};

export class CreateReminderModal extends React.Component<Props, State> {
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

      const newLeadInfo = await serviceProxy.createLeadReminder(this.props.leadInfo._id, values);

      this.props.changeInput({
        reminders: newLeadInfo.reminders,
      });
      formikBag.resetForm();
      this.props.closeModal();
      notification.success({
        message: 'Create successfully',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Create lead reminder failed',
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
      day: moment(new Date()),
      hour: moment(new Date()),
    };

    const editValidationSchema = yup.object().shape({
      title: yup.string().required('Please input title'),
      day: yup.object().required('Please select date'),
      hour: yup.object().required('Please select time'),
    });

    return (
      <Formik
        initialValues={initialValue}
        onSubmit={async (values, formikBag: any) => this.handleSubmit(toReminder(values), formikBag)}
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
            title='Add reminder'
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
                        defaultValue={context.values.day}
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
                        defaultValue={context.values.hour}
                        placeholder={translate('lang:selectTime')}
                        format={'HH:mm'}
                        onChange={(_time) => {
                          context.setFieldValue('hour', _time);
                        }} />
                    </div>
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
