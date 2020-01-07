import React from 'react';
import { Modal, Form, Row, Col, Input, Icon, Select } from 'antd';
// import * as yup from 'yup';
import { FormikContext, Formik } from 'formik';
import { validateField } from '@client/core';
import * as yup from 'yup';
import { translate } from '@client/i18n';

interface Props {
  title: string;
  visible: boolean;
  handleSubmit: (values: any, formikBag: any) => void;
  closeModal: () => void;
  initialValue?: {
    name?: string;
    field?: string;
    condition?: string;
    conditionValue?: string;
    discountType?: string;
    discountValue?: string;
  };
  loading: boolean;
}
export const ProductComboModal = (props: Props) => {
  const initialValue = props.initialValue && ((props.initialValue as any)._id) ? props.initialValue : {
    name: '',
    field: undefined,
    condition: undefined,
    conditionValue: undefined,
    discountType: undefined,
    discountValue: undefined,
  };

  const editValidationSchema = yup.object().shape({
    name: yup.string().matches(/[a-zA-Z0-9 ]$/, translate('lang:validateNameValid')).required('Name is required'),
    field: yup.string().required(translate('lang:validateConditionFieldRequired')),
    condition: yup.string().required(translate('lang:validateConditionRequired')),
    conditionValue: yup.number().required(translate('lang:validateConditionValueRequired')),
    discountType: yup.string().required(translate('lang:validateDiscountTypeRequired')),
    discountValue: yup.number().required(translate('lang:validateDiscountValueRequired')),
  });

  return (
    <Formik
      initialValues={initialValue}
      onSubmit={async (values, formikBag: any) => props.handleSubmit(values, formikBag)}
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
          confirmLoading={props.loading}
        >
          <Form>
            <Row type='flex' gutter={12}>
              <Col xs={24}>
                <h4>{translate('lang:combosName')}</h4>
                <Col span={24}>
                  <Form.Item validateStatus={context.errors.name ? 'error' : undefined} help={context.errors.name}>
                    <Input
                      value={context.values.name}
                      onChange={context.handleChange}
                      prefix={<Icon type='gift' />}
                      onBlur={() => validateField({
                        fieldName: 'name',
                        validateSchema: editValidationSchema,
                        context,
                      })}
                      placeholder={translate('lang:name')}
                      name='name'
                    />
                  </Form.Item>
                </Col>
              </Col>
              <Col xs={24}>
                <h4>{translate('lang:combosCriteria')}</h4>
                <Col xs={24}>
                  <Form.Item validateStatus={context.errors.field ? 'error' : undefined} help={context.errors.field}>
                    <Select style={{ width: '100%' }} value={context.values.field} onChange={(val: any) => {
                      context.setFieldValue('field', val);
                      if (val !== context.values.field) {
                        context.setFieldValue('condition', undefined);
                      }
                    }} placeholder='Condition field' onBlur={() => validateField({
                      fieldName: 'field',
                      validateSchema: editValidationSchema,
                      context,
                    })}>
                      <Select.Option key={'0'} value='noCriteria'>{translate('lang:noCriteria')}</Select.Option>
                      <Select.Option key={'1'} value='courseCount'>{translate('lang:numberOfCourses')}</Select.Option>
                      <Select.Option key={'2'} value='tuitionBD'>{translate('lang:officialTotalTuitionFee')}</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                {
                  context.values.field === 'noCriteria' ? (
                    <div></div>
                  ) : (
                      <>
                        <Col xs={24}>
                          <Form.Item validateStatus={context.errors.condition ? 'error' : undefined} help={context.errors.condition}>
                            <Select style={{ width: '100%' }} value={context.values.condition} placeholder='Condition' onChange={(val: any) => {
                              context.setFieldValue('condition', val);
                            }} onBlur={() => validateField({
                              fieldName: 'condition',
                              validateSchema: editValidationSchema,
                              context,
                            })}>
                              {context.values.field === 'tuitionBD' ? undefined : <Select.Option key={'3'} value='eq'>{translate('lang:eq')}</Select.Option>}
                              {context.values.field === 'tuitionBD' ? undefined : <Select.Option key={'4'} value='gt'>{translate('lang:gt')}</Select.Option>}
                              {context.values.field === 'courseCount' ? undefined : <Select.Option key={'5'} value='gte'>{translate('lang:gte')}</Select.Option>}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24}>
                          <Form.Item validateStatus={context.errors.conditionValue ? 'error' : undefined} help={context.errors.conditionValue}>
                            <Input
                              type='number'
                              name='conditionValue'
                              placeholder={translate('lang:conditionValue')}
                              value={context.values.conditionValue}
                              onChange={context.handleChange}
                              onBlur={() => validateField({
                                fieldName: 'conditionValue',
                                validateSchema: editValidationSchema,
                                context,
                              })}
                            />
                          </Form.Item>
                        </Col>
                      </>
                    )
                }
              </Col>
              <Col xs={24}>
                <h4>{translate('lang:discountPolicy')}</h4>
                <Col xs={12}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    validateStatus={context.errors.discountType ? 'error' : undefined} help={context.errors.discountType}>
                    <Select style={{ width: '100%' }} value={context.values.discountType} onChange={(val: any) => {
                      context.setFieldValue('discountType', val);
                    }} placeholder='Discount Type' onBlur={() => validateField({
                      fieldName: 'discountType',
                      validateSchema: editValidationSchema,
                      context,
                    })}>
                      <Select.Option key={'1'} value='AMOUNT'>{translate('lang:amountOfDiscount')}</Select.Option>
                      <Select.Option key={'2'} value='PERCENT'>{translate('lang:percentOfTuitionFee')}</Select.Option>
                      <Select.Option key={'3'} value='FIXED'>{translate('lang:tuitionFeeAfterDiscount')}</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    validateStatus={context.errors.discountValue ? 'error' : undefined} help={context.errors.discountValue}>
                    <Input
                      name='discountValue'
                      value={context.values.discountValue}
                      type='number'
                      onChange={context.handleChange}
                      placeholder={translate('lang:discountValue')}
                      onBlur={() => validateField({
                        fieldName: 'discountValue',
                        validateSchema: editValidationSchema,
                        context,
                      })}
                    />
                  </Form.Item>
                </Col>
              </Col>
            </Row>
          </Form>
        </Modal>
      )}
    </Formik>
  );
};
