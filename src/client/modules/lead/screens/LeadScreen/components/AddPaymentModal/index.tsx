import React, { useState } from 'react';
import { Modal, Form, InputNumber, DatePicker, Input, notification } from 'antd';
import { Formik, FormikContext, FormikActions } from 'formik';
import * as yup from 'yup';
import moment from 'moment';
import { Lead, Customer, LeadPaymentItem } from '@client/services/service-proxies';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import _ from 'lodash';
import { getErrorMessage, formatMoney } from '@client/core';

export enum PaymentType {
  Payment = 'Payment',
  Refund = 'Refund',
}

interface Props {
  visible: boolean;
  type: PaymentType;
  leadInfo: Lead;
  changeInput: (values: (Customer|Lead)) => void;
  closeModal: () => void;
}

export const AddPaymentModal = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);

  const addPayment = async (values: LeadPaymentItem, formikBag: FormikActions<any>) => {
    try {
      setLoading(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      let newLeadInfo: any;
      if (props.type === PaymentType.Payment) {
        newLeadInfo = await serviceProxy.addLeadPayment(_.get(props.leadInfo, '_id'), values);
      } else {
        newLeadInfo = await serviceProxy.addLeadRefund(_.get(props.leadInfo, '_id'), values);
      }
      props.changeInput(newLeadInfo);
      notification.success({
        message: props.type === PaymentType.Payment ? 'Add payment success' : 'Add refund success',
        placement: 'bottomRight',
      });
      formikBag.resetForm({});
      props.closeModal();
    } catch (error) {
      notification.error({
        message: props.type === PaymentType.Payment ? 'Add payment failed' : 'Add refund failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!props.visible) {
    return null;
  }

  const paymentValidationSchema = yup.object().shape({
    amount: yup.number().required('Please input amount')
      .min(1000, 'Invalid amount (> 1000)'),
    payday: yup.string().required('Please select pay day'),
    note: yup.string().nullable(true),
  });

  const initialValue = {
    amount: 0,
    payday: moment().toISOString(),
    note: '',
  };
  return (
    <Formik
      initialValues={initialValue}
      onSubmit={addPayment}
      validationSchema={paymentValidationSchema}
      validateOnChange={false}
    >
      {(context: FormikContext<any>) => {
        return (
          <Modal
            title={props.type === PaymentType.Payment ? 'Add payment' : 'Add refund'}
            visible={props.visible}
            onCancel={props.closeModal}
            confirmLoading={loading}
            onOk={() => context.handleSubmit()}
          >
            <Form>
              <Form.Item
                label='Amount'
                validateStatus={context.errors.amount ? 'error' : undefined}
                help={context.errors.amount}
              >
                <InputNumber
                  style={{width: '100%'}}
                  value={context.values.amount}
                  onChange={((value: number) => context.setFieldValue('amount', value ? value : 0)) as any}
                  placeholder=''
                  name='amount'
                />
                {context.values.amount && !context.errors.amount ? (
                  <div>
                    <i>{formatMoney(context.values.amount)}</i>
                  </div>
                ) : null}
              </Form.Item>

              <Form.Item
                label='Pay day'
                validateStatus={context.errors.payday ? 'error' : undefined}
                help={context.errors.payday}
              >
                <DatePicker
                  style={{width: '100%'}}
                  value={moment(context.values.payday)}
                  format={'DD-MM-YYYY'}
                  onChange={(date) => {
                    context.setFieldValue('payday', date!.toISOString());
                  }}
                  placeholder=''
                  name='payday'
                />
              </Form.Item>

              <Form.Item
                label='Note'
                validateStatus={context.errors.note ? 'error' : undefined}
                help={context.errors.note}
              >
                <Input
                  value={context.values.note}
                  onChange={context.handleChange}
                  placeholder=''
                  name='note'
                />
              </Form.Item>
            </Form>
          </Modal>
        );
      }}
    </Formik>
  );
};
