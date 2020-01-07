import * as React from 'react';
import { Form, message, Tabs, Icon, Input, Button, Select } from 'antd';
import firebase from 'firebase/app';
import 'firebase/auth';
import { AuthLayout } from '../../../../layouts';
import { validateField, hasSignInOption } from '@client/core';
import { Formik, FormikContext } from 'formik';
import * as yup from 'yup';
import { translate } from '@client/i18n';
import './LoginScreen.less';
import { getServiceProxy } from '@client/services';

interface State {
  activeTab: 'email'|'phone';
  loading: {
    login: boolean;
    getVerifyCode: boolean;
  };
}
interface Props {}
export class LoginScreen extends React.Component<Props, State> {
  state: State = {
    activeTab: 'email',
    loading: {
      login: false,
      getVerifyCode: false,
    },
  };

  componentDidMount() {
    (window as any).recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
      'size': 'invisible',
    });
  }

  activeTabChange = ({activeTab}: {activeTab: 'email'|'phone'}) => {
    this.setState({
      activeTab,
    });
  }

  login = async (values: any) => {
    this.setState({
      loading: {
        ...this.state.loading,
        login: true,
      },
    });

    try {
      if (this.state.activeTab === 'email') {
        const result = await firebase.auth().signInWithEmailAndPassword(values.email, values.password);
        if (result.user!.emailVerified) {
          const [serviceProxy, idToken] = await Promise.all([
            getServiceProxy(),
            firebase.auth().currentUser!.getIdToken(true),
          ]);
          await serviceProxy.registerUser({idToken});

          message.success('Log in success!!');
          window.location.href = '/dashboard';
        } else {
          firebase.auth().signOut();
          message.error('This account is de-activate. Please contact Administrator');
          this.setState({
            loading: {
              ...this.state.loading,
              login: false,
            },
          });
        }
      } else {
        await (window as any).confirmationResult.confirm(values.verificationCode);
        const [serviceProxy, idToken] = await Promise.all([
          getServiceProxy(),
          firebase.auth().currentUser!.getIdToken(true),
        ]);
        await serviceProxy.registerUser({idToken});

        message.success('Log in success!!');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          login: false,
        },
      });
    }
  }

  getCode = async (values: any) => {
    this.setState({
      loading: {
        ...this.state.loading,
        getVerifyCode: true,
      },
    });

    try {

      const fullPhoneNo = `${values.countryCode}${values.phoneNo}`;
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmationResult = await firebase.auth().signInWithPhoneNumber(fullPhoneNo, appVerifier);
      (window as any).confirmationResult = confirmationResult;
      message.success('Send verification code success!!');

      this.setState({
        loading: {
          ...this.state.loading,
          getVerifyCode: false,
        },
      });

    } catch (error) {
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          getVerifyCode: false,
        },
      });
    }
  }

  render() {
    const EmailValidateSchema = yup.object().shape({
      email: yup.string()
        .required(translate('common:pleaseInputEmail')),
      password: yup.string()
        .required(translate('common:pleaseInputPassword')),
    });

    const PhoneNumberValidateSchema = yup.object().shape({
      countryCode: yup.string()
        .required(translate('common:pleaseInputCountryCode')),
      phoneNo: yup.string()
        .matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, translate('common:invalidPhoneNo'))
        .required(translate('common:pleaseInputPhoneNo')),
    });

    const VerifyCodeValidateSchema = yup.object().shape({
      verifyCode: yup.string()
        .required(translate('common:pleaseInputVerifyCode')),
    });

    return (
      <AuthLayout pageName='login'>
        <div className='login-screen'>
        <Tabs activeKey={this.state.activeTab} onChange={(activeTab) => this.activeTabChange({ activeTab } as any)}>
            {hasSignInOption('email') && (
              <Tabs.TabPane tab={<span><Icon type='mail' />Email</span>} key='email'>
                <Formik
                  initialValues={{
                    email: '',
                    password: '',
                  }}
                  validateOnChange={false}
                  validationSchema={EmailValidateSchema}
                  onSubmit={async (values, formikBag) => {
                    await this.login(values);
                    formikBag.resetForm({
                      email: '',
                      password: '',
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
                          type='email'
                          name='email'
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
                          placeholder={translate('common:password')}
                          type='password'
                          name='password'
                        />
                      </Form.Item>

                      <Form.Item className='button-container'>
                        {/* {props.getFieldDecorator('rememberMe')(
                          <Checkbox>Remember me</Checkbox>,
                        )} */}
                        <span></span>
                        <Button type='primary' loading={this.state.loading.login} htmlType='submit'>Log in</Button>
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
                    <Form>
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
                          placeholder={translate('common:phoneNo')}
                          enterButton={<Button type='primary' loading={this.state.loading.getVerifyCode}>{translate('common:sendCode')}</Button>}
                          onSearch={context.handleSubmit as any}
                          name='phoneNo'
                        />
                      </Form.Item>
                    </Form>
                  )}
                </Formik>

                <Formik
                  initialValues={{
                    verifyCode: '',
                  }}
                  validateOnChange={false}
                  validationSchema={VerifyCodeValidateSchema}
                  onSubmit={async (values, formikBag) => {
                    await this.login(values);
                    formikBag.resetForm({});
                  }}
                >
                  {(context: FormikContext<any>) => (
                    <Form onSubmit={context.handleSubmit}>
                      <Form.Item validateStatus={context.errors.verifyCode ? 'error' : undefined} help={context.errors.verifyCode}>
                        <Input
                          value={context.values.verifyCode}
                          onChange={context.handleChange}
                          onBlur={context.handleBlur}
                          placeholder={translate('common:verifyCode')}
                          name='verifyCode'
                        />
                      </Form.Item>
                      <Form.Item className='button-container'>
                        {/* {props.getFieldDecorator('rememberMe')(
                          <Checkbox>Remember me</Checkbox>,
                        )} */}
                        <span></span>
                        <Button type='primary' loading={this.state.loading.login} htmlType='submit'>Log in</Button>
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
