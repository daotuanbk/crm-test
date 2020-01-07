import React from 'react';
import { Modal, Form, Row, Col, Input, Select, DatePicker } from 'antd';
// import * as yup from 'yup';
import { FormikContext, Formik } from 'formik';
import { validateField } from '@client/core';
import * as yup from 'yup';
import moment from 'moment';
import { translate } from '@client/i18n';

interface Props {
  title: string;
  visible: boolean;
  handleSubmit: (values: any, formikBag: any) => void;
  closeModal: () => void;
  initialValue?: {
    paymentType?: string;
    amount?: string;
    note?: string;
    payDay?: Date | string;
  };
  loading: boolean;
  productOrder?: any;
  tuition?: any;
  combo?: any;
}

export const PaymentTransactionModal = (props: Props) => {
  const initialValue = props.initialValue && ((props.initialValue as any)._id) ? props.initialValue : {
    paymentType: undefined,
    type: undefined,
    course: undefined,
    amount: 0,
    note: undefined,
    payDay: undefined,
  };

  const convertPriceToText = (value: number) => {
    if (value) {
      if (value <= 1000) {
        return '';
      } else {
        // tslint:disable-next-line
        var DOCSO = function () { var t = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"], r = function (r: any, n: any) { var o = "", a = Math.floor(r / 10), e = r % 10; return a > 1 ? (o = " " + t[a] + " mươi", 1 == e && (o += " mốt")) : 1 == a ? (o = " mười", 1 == e && (o += " một")) : n && e > 0 && (o = " lẻ"), 5 == e && a >= 1 ? o += " lăm" : 4 == e && a >= 1 ? o += " tư" : (e > 1 || 1 == e && 0 == a) && (o += " " + t[e]), o }, n = function (n: any, o: any) { var a = "", e = Math.floor(n / 100), n = n % 100 as any; return o || e > 0 ? (a = " " + t[e] + " trăm", a += r(n, !0)) : a = r(n, !1), a }, o = function (t: any, r: any) { var o = "", a = Math.floor(t / 1e6), t = t % 1e6 as any; a > 0 && (o = n(a, r) + " triệu", r = !0); var e = Math.floor(t / 1e3), t = t % 1e3 as any; return e > 0 && (o += n(e, r) + " ngàn", r = !0), t > 0 && (o += n(t, r)), o }; return { doc: function (r: any) { if (0 == r) return t[0]; var n = "", a = ""; do { var ty = r % 1e9, r = Math.floor(r / 1e9) as any, n = r > 0 ? o(ty, !0) + a + n : o(ty, !1) + a + n, a = " tỷ"; } while (r > 0); return n.trim() } } }();
        const text = DOCSO.doc(value as any) + ' đồng';
        return text.charAt(0).toUpperCase() + text.slice(1);
      }
    } else return '';
  };

  const renderPaymentType = (context: any) => {
    const { productOrder } = props;
    if (!productOrder) return null;
    const { courses } = productOrder;
    return (
      <Col xs={24}>
        <h4>{translate('lang:selectType')}</h4>
        <Form.Item validateStatus={context.errors.paymentType ? 'error' : undefined} help={context.errors.paymentType}>
          <Select
            value={context.values.type}
            onChange={(val: string) => {
              context.setFieldValue('type', val);
            }}
            onBlur={() => validateField({
              fieldName: 'type',
              validateSchema: editValidationSchema,
              context,
            })}
            placeholder='Type'
          >
            {
              productOrder.comboId && (
                <Select.Option value={'combo'} key={'combo'}>{translate('lang:combo')}</Select.Option>
              )
            }
            {
              courses.slice(getComboCourseCount(), courses.length).length && (
                <Select.Option value={'course'} key={'course'}>{translate('lang:course')}</Select.Option>
              )
            }
          </Select>
        </Form.Item>
      </Col>
    );
  };

  const getComboCourseCount = () => {
    const { productOrder } = props;
    if (!productOrder) return 0;
    const { comboId, courses } = productOrder;
    if (!comboId) return 0;
    if (comboId.field === 'courseCount' && comboId.condition === 'eq') {
      return comboId.conditionValue;
    }
    return courses.length;
  };
  const currentDate = moment(new Date());

  const editValidationSchema = yup.object().shape({
    paymentType: yup.string().required(translate('lang:validatePaymentType')),
    // course: yup.string().required('Course is required'),
    amount: yup.number().min(0, translate('lang:validatePaymentAmount')).required(translate('lang:validatePaymentAmountRequired')),
    note: yup.string(),
  });
  return (
    <Formik
      initialValues={initialValue}
      onSubmit={async (values, formikBag: any) => {
        await props.handleSubmit(values, formikBag);
        formikBag.resetForm({});
      }}
      validateOnChange={false}
      validationSchema={editValidationSchema}
    >
      {(context: FormikContext<any>) => {
        return (
          <Modal
            title={props.title}
            visible={props.visible}
            onOk={(e) => props.handleSubmit(e, context)}
            onCancel={() => {
              context.resetForm();
              props.closeModal();
            }}
            okButtonProps={{
              onClick: () => context.handleSubmit(),
            }}
            confirmLoading={props.loading}
            maskClosable={false}
          >
            <Form>
              <Row type='flex' gutter={12}>
                <Col xs={24}>
                  <h4>{translate('lang:paymentType')}</h4>
                  <Form.Item validateStatus={context.errors.paymentType ? 'error' : undefined} help={context.errors.paymentType}>
                    <Select
                      value={context.values.paymentType}
                      onChange={(val: string) => {
                        context.setFieldValue('course', undefined);
                        context.setFieldValue('paymentType', val);
                      }}
                      onBlur={() => validateField({
                        fieldName: 'paymentType',
                        validateSchema: editValidationSchema,
                        context,
                      })}
                      placeholder={translate('lang:paymentType')}
                    >
                      <Select.Option value='Tuition' key='1'>{translate('lang:makePayment')}</Select.Option>
                      <Select.Option value='Change' key='2'>{translate('lang:refund')}</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                {
                  renderPaymentType(context)
                }
                {
                  context.values.type === 'course' && (
                    <Col xs={24}>
                      <h4>{translate('lang:course')}</h4>
                      <Form.Item>
                        <Select
                          value={context.values.course}
                          onChange={(val: string) => {
                            context.setFieldValue('course', val);
                          }}
                          onBlur={() => validateField({
                            fieldName: 'course',
                            validateSchema: editValidationSchema,
                            context,
                          })}
                          placeholder={translate('lang:course')}
                        >
                          {
                            props.productOrder && props.productOrder.courses
                            && props.productOrder.courses.slice(getComboCourseCount(), props.productOrder.courses.length).map((item: any) => {
                              return <Select.Option value={item._id} key={item._id}>{item.name}</Select.Option>;
                            })
                          }
                        </Select>
                      </Form.Item>
                    </Col>
                  )
                }
                <Col xs={24}>
                  <h4>{translate('lang:paymentAmount')}</h4>
                  <Form.Item validateStatus={context.errors.amount ? 'error' : undefined} help={context.errors.amount}>
                    <Input style={{ width: '100%' }} value={context.values.amount} onChange={(e: any) => {
                      context.setFieldValue('amount', e.target.value);
                    }}
                      onBlur={() => validateField({
                        fieldName: 'amount',
                        validateSchema: editValidationSchema,
                        context,
                      })}
                      addonAfter='VND'
                      type='number'
                      placeholder={translate('lang:paymentAmount')}
                    />
                  </Form.Item>
                  <p style={{ color: 'green', marginBottom: '5px', marginTop: '-15px' }}>{convertPriceToText(context.values.amount)}</p>
                  {
                    context.values.amount && props.tuition && props.tuition.remaining !== undefined && Number(context.values.amount) > Number(props.tuition.remaining) ?
                      <p style={{ color: 'red', marginBottom: '5px' }}>Transaction amount is bigger than lead's remaining tuition</p> : <div></div>
                  }
                </Col>
                <Col xs={24}>
                  <h4>{translate('lang:payDay')}</h4>
                  <Form.Item validateStatus={context.errors.payDay ? 'error' : undefined} help={context.errors.payDay}>
                    <DatePicker defaultValue={context.values.payDay ? moment(new Date(context.values.payDay)) : context.values.createdAt ? moment(new Date(context.values.createdAt)) : currentDate}
                      style={{ width: '100%' }} onChange={(date) => {
                        context.setFieldValue('payDay', date);
                      }} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <h4>{translate('lang:note')}</h4>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    validateStatus={context.errors.note ? 'error' : undefined}
                    help={context.errors.note}>
                    <Input style={{ width: '100%' }} value={context.values.note} onChange={(e: any) => {
                      context.setFieldValue('note', e.target.value);
                    }}
                      onBlur={() => validateField({
                        fieldName: 'note',
                        validateSchema: editValidationSchema,
                        context,
                      })}
                      placeholder={translate('lang:note')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        );
      }}
    </Formik>
  );
};
