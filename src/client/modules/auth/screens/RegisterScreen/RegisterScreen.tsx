import * as React from 'react';
import { AuthLayout } from '../../../../layouts';
import * as yup from 'yup';
import { message, Tabs, Icon, Form, Input, Row, Col, Button, Select } from 'antd';
import firebase from 'firebase/app';
import 'firebase/auth';
import { getServiceProxy } from '../../../../services';
import Router from 'next/router';
import { hasSignInOption, validateField } from '@client/core';
import { Formik, FormikContext } from 'formik';
import './RegisterScreen.less';
import { config } from '@client/config';

interface State {
  activeTab: 'email'|'phone';
  phone: {
    countryCode: string;
    phoneNo: string;
  };
  loading: {
    register: boolean;
    getVerifyCode: boolean;
  };
}
interface Props {}
export class RegisterScreen extends React.Component<Props, State> {
  state: State = {
    activeTab: 'email',
    phone: {
      countryCode: '',
      phoneNo: '',
    },
    loading: {
      register: false,
      getVerifyCode: false,
    },
  };

  componentDidMount() {
    (window as any).recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
      'size': 'invisible',
    });
  }

  register = async (values: any) => {
    this.setState({
      loading: {
        ...this.state.loading,
        register: true,
      },
    });

    try {
      if (this.state.activeTab === 'email') {
        const newUser = await firebase.auth().createUserWithEmailAndPassword(values.email, values.password);
        newUser.user!.sendEmailVerification();

        // create mongodb record
        const [serviceProxy, idToken] = await Promise.all([
          getServiceProxy(),
          firebase.auth().currentUser!.getIdToken(),
        ]);
        serviceProxy.registerUser({idToken});

        // redirect
        message.success('Register success. Please verify your email!!', 4);
        Router.push('/auth/login');
      } else if (this.state.activeTab === 'phone') {
        await (window as any).confirmationResult.confirm(values.verifyCode);
        const [serviceProxy, idToken] = await Promise.all([
          getServiceProxy(),
          firebase.auth().currentUser!.getIdToken(true),
        ]);
        await serviceProxy.registerUser({
          idToken,
          phone: {
            countryCode: this.state.phone.countryCode,
            phoneNo: this.state.phone.phoneNo,
            fullPhoneNo: `${this.state.phone.countryCode}${this.state.phone.phoneNo}`,
          },
        });

        const form = document.getElementById('form');
        const input = document.createElement('input');
        input.type = 'text';
        input.name = 'token';
        input.value = idToken;
        form!.appendChild(input);
        (form as any).submit();
        message.success('Register success!!');
      }
    } catch (error) {
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          register: false,
        },
      });
    }
  }

  getCode = async (values: {countryCode: string; phoneNo: string}) => {
    this.setState({
      phone: {
        phoneNo: values.phoneNo,
        countryCode: values.countryCode,
      },
      loading: {
        ...this.state.loading,
        getVerifyCode: true,
      },
    });

    try {
      const fullPhoneNumber = `${values.countryCode}${values.phoneNo}`;
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmationResult = await firebase.auth().signInWithPhoneNumber(fullPhoneNumber, appVerifier);
      (window as any).confirmationResult = confirmationResult;
      message.success('Send verification code success!!');
    } catch (error) {
      message.error(error.message);
    }

    this.setState({
      loading: {
        ...this.state.loading,
        getVerifyCode: false,
      },
    });
  }

  activeTabChange = ({ activeTab }: {activeTab: 'email'|'phone'}) => {
    this.setState({
      activeTab,
    });
  }

  render () {
    const PhoneNumberValidateSchema = yup.object().shape({
      countryCode: yup.string()
        .required('Please select country code'),
      phoneNo: yup.string()
        .matches(config.regex.phone, 'Invalid phone number')
        .required('Please input phone number'),
    });

    const VerifyCodeValidateSchema = yup.object().shape({
      verifyCode: yup.string()
        .required('Please input vefiry code'),
    });

    const EmailValidateSchema = yup.object().shape({
      email: yup.string()
        .email('Invalid email')
        .required('Please input email'),
      password: yup.string()
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, 'Password must be more than 6 characters and contain at least 1 number')
        .required('Please input password'),
      confirmPassword: yup.string()
        .required('Please verify email'),
    });

    return (
      <AuthLayout pageName='register'>
        <div className='register-screen'>
        <Tabs activeKey={this.state.activeTab} onChange={(activeTab) => this.activeTabChange({ activeTab } as any)}>
            {hasSignInOption('email') && (
              <Tabs.TabPane tab={<span><Icon type='mail' />Email</span>} key='email'>
                <Formik
                  initialValues={{
                    email: '',
                    password: '',
                    confirmPassword: '',
                  }}
                  validateOnChange={false}
                  validationSchema={EmailValidateSchema}
                  validate={(values) => {
                    const errors: any = {};
                    if (values.password !== values.confirmPassword) {
                      errors.confirmPassword = `Confirm password didn't match`;
                    }
                    return errors;
                  }}
                  onSubmit={async (values, formikBag) => {
                    await this.register(values);
                    formikBag.resetForm({
                      email: '',
                      password: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  {(context: FormikContext<any>) => (
                    <Form onSubmit={context.handleSubmit}>
                      <Form.Item validateStatus={context.errors.email ? 'error' : undefined} help={context.errors.email}>
                        <Input
                          value={context.values.email}
                          onChange={context.handleChange}
                          onBlur={() => validateField({
                            fieldName: 'email',
                            validateSchema: EmailValidateSchema,
                            context,
                          })}
                          prefix={<Icon type='mail' />}
                          placeholder='Email'
                          type='email' name='email'
                        />
                      </Form.Item>

                      <Form.Item validateStatus={context.errors.password ? 'error' : undefined} help={context.errors.password}>
                        <Input
                          value={context.values.password}
                          onChange={context.handleChange}
                          onBlur={() => validateField({
                            fieldName: 'password',
                            validateSchema: EmailValidateSchema,
                            context,
                          })}
                          prefix={<Icon type='lock' />}
                          placeholder='Password'
                          type='password'
                          name='password'
                        />
                      </Form.Item>

                      <Form.Item validateStatus={context.errors.confirmPassword ? 'error' : undefined} help={context.errors.confirmPassword}>
                        <Input
                          value={context.values.confirmPassword}
                          onChange={context.handleChange}
                          prefix={<Icon type='lock' />}
                          placeholder='Confirm password'
                          type='password'
                          name='confirmPassword'
                        />
                      </Form.Item>

                      <Form.Item className='button-container'>
                        <Row type='flex'>
                          <Col xs={16}>
                            {/* <span>I agree with term & conditions</span> */}
                          </Col>
                          <Col xs={8} className='align-right'>
                            <Button type='primary' htmlType='submit' loading={this.state.loading.register}>Register</Button>
                          </Col>
                        </Row>
                      </Form.Item>
                    </Form>
                  )}
                </Formik>
              </Tabs.TabPane>
            )}
            {hasSignInOption('phone') && (
              <Tabs.TabPane tab={<span><Icon type='phone' />SMS</span>} key='phone'>
                <Formik
                  initialValues={{
                    countryCode: '+84',
                    phoneNo: '',
                  }}
                  validateOnChange={false}
                  validationSchema={PhoneNumberValidateSchema}
                  onSubmit={async (values) => {
                    await this.getCode(values);
                  }}
                >
                  {(context: FormikContext<any>) => (
                    <Form.Item validateStatus={context.errors.phoneNo || context.errors.countryCode ? 'error' : undefined} help={context.errors.phoneNo || context.errors.countryCode}>
                      <Input.Search
                        addonBefore={(
                          <Select style={{ width: 120 }} value={context.values.countryCode} onChange={context.handleChange}>
                            <Select.Option value='+84'>VN (+84)</Select.Option>
                          </Select>
                        )}
                        value={context.values.phoneNo}
                        onChange={context.handleChange}
                        onBlur={context.handleBlur}
                        placeholder='Phone number'
                        enterButton={<Button type='primary' loading={this.state.loading.getVerifyCode}>Send code</Button>}
                        onSearch={context.handleSubmit as any}
                        name='phoneNo'
                      />
                    </Form.Item>
                  )}
                </Formik>

                <Formik
                  initialValues={{
                    verifyCode: '',
                  }}
                  validateOnChange={false}
                  validationSchema={VerifyCodeValidateSchema}
                  onSubmit={async (values, formikBag) => {
                    await this.register(values);
                    formikBag.resetForm({});
                  }}
                >
                  {(context: FormikContext<any>) => (
                    <Form>
                      <Form.Item validateStatus={context.errors.verifyCode ? 'error' : undefined} help={context.errors.verifyCode}>
                        <Input
                          value={context.values.verifyCode}
                          onChange={context.handleChange}
                          onBlur={context.handleBlur}
                          placeholder='Verification code'
                          name='verifyCode'
                        />
                      </Form.Item>
                      <Form.Item className='button-container' style={{marginBottom: '0px', display: 'flex', justifyContent: 'flex-end'}}>
                        {/* <span>I agree with term & conditions</span> */}
                        <Button type='primary' htmlType='submit' loading={this.state.loading.register}>Register</Button>
                      </Form.Item>
                    </Form>
                  )}
                </Formik>
              </Tabs.TabPane>
            )}
          </Tabs>
          <div id='recaptcha' />
          <form id='form' method='post' action='/auth/login' />
        </div>
      </AuthLayout>
    );
  }
}
