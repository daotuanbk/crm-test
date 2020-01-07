import React from 'react';
import { Modal, Form, Row, Col, Input } from 'antd';
// import * as yup from 'yup';
import { FormikContext, Formik } from 'formik';
import { translate } from '@client/i18n';

interface Props {
  title: string;
  visible: boolean;
  handleSubmit: (values: any, formikBag: any) => void;
  closeModal: () => void;
  initialValue?: {
    name?: string;
    address?: string;
  };
  loading: boolean;
  options?: string[];
}

interface State {
  isAdding: boolean;
}

export class SystemConfigModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isAdding: false,
    };
  }
  render() {
    const initialValue = this.props.initialValue && ((this.props.initialValue as any)._id) ? this.props.initialValue : {
      option: '',
      value: '',
    };
    return (
      <Formik
        initialValues={initialValue}
        onSubmit={async (values, formikBag: any) => this.props.handleSubmit(values, formikBag)}
        validateOnChange={false}
      >
        {(context: FormikContext<any>) => (
          <Modal
            title={this.props.title}
            visible={this.props.visible}
            onOk={(e) => this.props.handleSubmit(e, context)}
            onCancel={this.props.closeModal}
            okButtonProps={{
              onClick: () => context.handleSubmit(),
            }}
            confirmLoading={this.props.loading}
          >
            <Form>
              <Row type='flex' gutter={12}>
                <Col xs={12}>
                  <Form.Item validateStatus={context.errors.option ? 'error' : undefined} help={context.errors.option}>
                    <Input
                      value={context.values.option}
                      onChange={context.handleChange}
                      /*prefix={<Icon type='user' />}*/
                      placeholder={translate('lang:option')}
                      name='option'
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item validateStatus={context.errors.address ? 'error' : undefined} help={context.errors.value}>
                    <Input
                      value={context.values.value}
                      onChange={context.handleChange}
                      /*prefix={<Icon type='user' />}*/
                      placeholder={translate('lang:value')}
                      name='value'
                    />
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
