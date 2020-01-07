import React from 'react';
import './ReceptionistModal.less';
import { Modal, Form, Row, Col, Input, Icon } from 'antd';
import * as yup from 'yup';
import { FormikContext, Formik } from 'formik';
import { validateField } from '../../../../../core';
import { Role } from '@client/services/service-proxies';
import { getServiceProxy } from '@client/services';

interface Props {
  title: string;
  visible: boolean;
  rolesData?: Role[];
  handleSubmit: (values: any, formikBag: any) => void;
  closeModal: () => void;
  initialValue?: {
    familyName?: string;
    givenName?: string;
    email?: string;
  };
  loading: boolean;
}
export const ReceptionistModal = (props: Props) => {
  const initialValue = props.initialValue && (props.initialValue as any)._id ? props.initialValue : {
    familyName: '',
    givenName: '',
    password: '',
    confirmPassword: '',
    email: '',
    roles: [],
  };

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
  const createValidationSchema = yup.object().shape({
    familyName: yup.string().min(2, 'Too short').max(50, 'Too long').required('Family name is required'),
    givenName: yup.string().min(2, 'Too short').max(50, 'Too long').required('Given name is required'),
    email: yup.string().min(2, 'Too short').max(50, 'Too long').email('Invalid email').required('Family name is required'),
    password: yup.string().matches(passwordRegex, 'Password must be minimum 6 characters, at least 1 letter, 1 number and 1 special character').required('Password is required'),
    confirmPassword: yup.string().required('Please confirm your password'),
  });

  const editValidationSchema = yup.object().shape({
    familyName: yup.string().min(2, 'Too short').max(50, 'Too long').required('Family name is required'),
    givenName: yup.string().min(2, 'Too short').max(50, 'Too long').required('Given name is required'),
    email: yup.string().min(2, 'Too short').max(50, 'Too long').required('Family name is required'),
    password: yup.string().matches(passwordRegex, 'Password must be minimum 6 characters, at least 1 letter, 1 number and 1 special character'),
  });

  return (
    <Formik
      initialValues={initialValue}
      validationSchema={props.initialValue && (props.initialValue as any)._id ? editValidationSchema : createValidationSchema}
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
                    placeholder='Family name'
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
                    placeholder='Given name'
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
                      context.setFieldError('email', 'Email has been used');
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
                placeholder='Password'
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
                      context.setFieldError('confirmPassword', 'Confirm password didnt match');
                    } else {
                      context.setFieldError('confirmPassword', '');
                    }
                  }
                }}
                prefix={<Icon type='lock' />}
                placeholder='Confirm password'
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
