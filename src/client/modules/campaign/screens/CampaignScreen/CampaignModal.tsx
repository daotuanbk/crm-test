import React from 'react';
import { Modal, Form, Row, Col, Input, InputNumber, Icon, Select } from 'antd';
// import * as yup from 'yup';
import { FormikContext, Formik } from 'formik';
import { generateProspectingSources } from '@client/core/helpers/generateProspectingSources';
import {
  PROSPECTING_LIST_SOURCE_FACEBOOK_CAMPAIGN,
  validateField,
} from '@client/core';
import * as yup from 'yup';
import { translate } from '@client/i18n';

const editValidationSchema = yup.object().shape({
  name: yup.string().required(translate('lang:validateNameRequired')),
  address: yup.string().min(2, translate('lang:validateTooShort')).max(20, translate('lang:validateTooLong')).required(translate('lang:validateAddressRequired')),
  order: yup.number().min(1, translate('lang:validateTooShort')).lessThan(6, translate('lang:validateOrderFrom1To5')).moreThan(0, translate('lang:validateOrderFrom1To5'))
    .required(translate('lang:validateOrderRequired')),
});

interface Props {
  title: string;
  visible: boolean;
  handleSubmit: (values: any, formikBag: any) => void;
  closeModal: () => void;
  initialValue: {
    name?: string;
    address?: string;
    _id: string;
  };
  loading: boolean;
  campaigns: any;
}
export const CampaignModal = (props: Props) => {
  const initialValue = props.initialValue && ((props.initialValue as any)._id) ? props.initialValue : {
    sourceId: '',
    name: '',
    order: 1,
  };

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
                {translate('lang:source')} <span style={{ color: 'red' }}>*</span> <br />
                <Form.Item
                  style={{ marginBottom: 10 }}
                  validateStatus={context.errors.sourceId ? 'error' : undefined} help={context.errors.sourceId}>
                  <Select
                    placeholder='Select a source'
                    defaultValue={context.values.sourceId}
                    style={{ width: '100%' }}
                    disabled={!!props.initialValue.name}
                    onChange={(val: any) => {
                      context.setFieldValue('sourceId', val);
                    }}
                  >
                    {
                      generateProspectingSources().map((item: any) => {
                        return <Select.Option key={item.label} value={item.value}>{item.label}</Select.Option>;
                      })
                    }
                  </Select>
                </Form.Item>
              </Col>
              {
                context.values.sourceId === PROSPECTING_LIST_SOURCE_FACEBOOK_CAMPAIGN && !props.initialValue.name ? (
                  <Col xs={24}>
                    {translate('lang:campaignName')} <span style={{ color: 'red' }}>*</span> <br />
                    <Form.Item
                      style={{ marginBottom: 10 }}
                      validateStatus={context.errors.name ? 'error' : undefined} help={context.errors.name}>
                      <Select
                        key={context.values.sourceId}
                        placeholder='Select a campaign'
                        disabled={!!(context.values.sourceId === PROSPECTING_LIST_SOURCE_FACEBOOK_CAMPAIGN && props.initialValue.name)}
                        style={{ width: '100%' }}
                        defaultValue={props.initialValue._id}
                        onChange={(_val: any, option: any) => {
                          if (option && option.props && option.props.children) {
                            context.setFieldValue('name', option.props.children);
                          }
                        }}
                        onBlur={() => validateField({
                          fieldName: 'name',
                          validateSchema: editValidationSchema,
                          context,
                        })}
                      >
                        {
                          props.campaigns.data.map((item: any) => {
                            return <Select.Option key={item.id} value={item.id} disabled={item.status !== 'ACTIVE'}>{item.name}</Select.Option>;
                          })
                        }
                      </Select>
                    </Form.Item>
                  </Col>
                ) : (
                    <Col xs={24}>
                      {translate('lang:campaignName')} <span style={{ color: 'red' }}>*</span> <br />
                      <Form.Item
                        style={{ marginBottom: 10 }}
                        validateStatus={context.errors.name ? 'error' : undefined} help={context.errors.name}>
                        <Input
                          value={context.values.name}
                          onChange={context.handleChange}
                          prefix={<Icon type='flag' />}
                          placeholder={translate('lang:campaignName')}
                          name='name'
                        />
                      </Form.Item>
                    </Col>
                  )
              }
              <Col xs={24}>
                <Form.Item
                  style={{ marginBottom: 0 }}
                  validateStatus={context.errors.order ? 'error' : undefined} help={context.errors.order}>
                  {translate('lang:order')}: &nbsp;
                                    <InputNumber
                    min={1}
                    max={5}
                    value={context.values.order}
                    onBlur={() => validateField({
                      fieldName: 'order',
                      validateSchema: editValidationSchema,
                      context,
                    })}
                    onChange={(val: any) => {
                      context.setFieldValue('order', val);
                    }}
                    style={{ width: '100%' }}
                    name='order' />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      )}
    </Formik>
  );
};
