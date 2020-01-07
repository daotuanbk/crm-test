import React from 'react';
import './GeneralManagerModal.less';
import { Modal, Form, Row, Col, Input, Icon, Select } from 'antd';
import * as yup from 'yup';
import { FormikContext, Formik } from 'formik';
import { validateField } from '../../../../../core';
import { Role, Centre } from '@client/services/service-proxies';
import { getServiceProxy } from '@client/services';
import { translate } from '@client/i18n';
const Option = Select.Option;

interface Props {
  title: string;
  visible: boolean;
  rolesData?: Role[];
  listCenters?: Centre[];
  listCentersFilters?: string[];
  handleSubmit: (values: any, formikBag: any) => void;
  closeModal: () => void;
  initialValue?: {
    familyName?: string;
    givenName?: string;
    email?: string;
  };
  loading: boolean;
}
export const GeneralManagerModal = (props: Props) => {
  const initialValue = props.initialValue && ((props.initialValue as any)._id || (props.initialValue as any).id) ? props.initialValue : {
    familyName: '',
    givenName: '',
    password: '',
    confirmPassword: '',
    email: '',
    roles: [],
  };

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
  const createValidationSchema = yup.object().shape({
    familyName: yup.string().min(2, translate('lang:validateTooShort')).max(50, translate('lang:validateTooLong')).required(translate('lang:validateFamilyNameRequired')),
    givenName: yup.string().min(2, translate('lang:validateTooShort')).max(50, translate('lang:validateTooLong')).required(translate('lang:validateGivenNameRequired')),
    email: yup.string().min(2, translate('lang:validateTooShort')).max(50, translate('lang:validateTooLong')).email(translate('lang:validateEmail')).required(translate('lang:validateEmailRequired')),
    password: yup.string().matches(passwordRegex, translate('lang:validatePasswordRegex')).required(translate('lang:validatePasswordRequired')),
    confirmPassword: yup.string().required(translate('lang:validateConfirmPassword')),
  });

  const editValidationSchema = yup.object().shape({
    familyName: yup.string().min(2, translate('lang:validateTooShort')).max(50, translate('lang:validateTooLong')).required(translate('lang:validateFamilyNameRequired')),
    givenName: yup.string().min(2, translate('lang:validateTooShort')).max(50, translate('lang:validateTooLong')).required(translate('lang:validateGivenNameRequired')),
    email: yup.string().min(2, translate('lang:validateTooShort')).max(50, translate('lang:validateTooLong')).required(translate('lang:validateEmailRequired')),
    password: yup.string().matches(passwordRegex, translate('lang:validatePasswordRegex')),
  });

  return (
    <Formik
      initialValues={initialValue}
      validationSchema={props.initialValue && (props.initialValue as any)._id ? editValidationSchema : createValidationSchema}
      onSubmit={async (values, formikBag: any) => {
        props.handleSubmit(values, formikBag);
      }}
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
              <Col xs={12}>
                <Form.Item validateStatus={context.errors.familyName ? 'error' : undefined} help={context.errors.familyName}>
                  <Input
                    value={context.values.familyName}
                    onChange={context.handleChange}
                    onBlur={() => validateField({
                      fieldName: 'familyName',
                      validateSchema: props.initialValue && (props.initialValue as any)._id ? editValidationSchema : createValidationSchema,
                      context,
                    })}
                    prefix={<Icon type='user' />}
                    placeholder={translate('lang:familyName')}
                    name='familyName'
                  />
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item validateStatus={context.errors.givenName ? 'error' : undefined} help={context.errors.givenName}>
                  <Input
                    value={context.values.givenName}
                    onChange={context.handleChange}
                    onBlur={() => validateField({
                      fieldName: 'givenName',
                      validateSchema: props.initialValue && (props.initialValue as any)._id ? editValidationSchema : createValidationSchema,
                      context,
                    })}
                    prefix={<Icon type='user' />}
                    placeholder={translate('lang:givenName')}
                    name='givenName'
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item validateStatus={context.errors.email ? 'error' : undefined} help={context.errors.email}>
              <Input
                value={context.values.email}
                onChange={context.handleChange}
                onBlur={async () => {
                  validateField({
                    fieldName: 'email',
                    validateSchema: props.initialValue && (props.initialValue as any)._id ? editValidationSchema : createValidationSchema,
                    context,
                  });

                  if (context.values.email) {
                    const serviceProxies = getServiceProxy();
                    const result = await serviceProxies.checkEmailExist(context.values.email);
                    if (result.emailExist) {
                      context.setFieldError('email', translate('lang:emailHasBeenUsed'));
                    } else {
                      context.setFieldError('email', '');
                    }
                  }
                }}
                prefix={<Icon type='mail' />}
                placeholder='Email'
                name='email'
              />
            </Form.Item>
            {props.listCenters && props.listCenters.length ?
              <Form.Item
                validateStatus={context.errors.centreId ? 'error' : undefined}
                help={context.errors.centreId}
              >
                <Select
                  placeholder={translate('lang:selectACenter')}
                  value={context.values.centreId}
                  onChange={(value) => context.setFieldValue('centreId', value)}>
                  {props.listCenters.map((item) =>
                    <Option
                      disabled={props.listCentersFilters && props.listCentersFilters.indexOf(item.id) !== -1 ? false : true}
                      key={item.id}
                      value={item.id}>{item.name}</Option>)}
                  <Option value={null as any} key={'none'}>{translate('lang:none')}</Option>
                </Select>
              </Form.Item> : null}

            <Form.Item validateStatus={context.errors.password ? 'error' : undefined} help={context.errors.password}>
              <Input
                value={context.values.password}
                onChange={context.handleChange}
                onBlur={() => validateField({
                  fieldName: 'password',
                  validateSchema: props.initialValue && (props.initialValue as any)._id ? editValidationSchema : createValidationSchema,
                  context,
                })}
                prefix={<Icon type='lock' />}
                placeholder={translate('lang:password')}
                name='password'
                type='password'
              />
            </Form.Item>

            <Form.Item
              style={{ marginBottom: 0 }}
              validateStatus={context.errors.confirmPassword ? 'error' : undefined} help={context.errors.confirmPassword}>
              <Input
                value={context.values.confirmPassword}
                onChange={context.handleChange}
                onBlur={() => {
                  validateField({
                    fieldName: 'confirmPassword',
                    validateSchema: props.initialValue && (props.initialValue as any)._id ? editValidationSchema : createValidationSchema,
                    context,
                  });

                  if (context.values.confirmPassword) {
                    if (context.values.confirmPassword !== context.values.password) {
                      context.setFieldError('confirmPassword', translate('lang:confirmPasswordDidNotMatched'));
                    } else {
                      context.setFieldError('confirmPassword', '');
                    }
                  }
                }}
                prefix={<Icon type='lock' />}
                placeholder={translate('lang:confirmPassword')}
                name='confirmPassword'
                type='password'
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </Formik>
  );
};
