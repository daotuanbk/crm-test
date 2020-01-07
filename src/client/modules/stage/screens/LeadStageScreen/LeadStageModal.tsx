import React from 'react';
import { Modal, Form, Row, Col, Input, Select } from 'antd';
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
    shortName?: string;
    order?: number;
    description?: string;
  };
  loading: boolean;
  options?: string[];
  eventConfigs: any;
}

interface State {
  isAdding: boolean;
}

export class LeadStageModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isAdding: false,
    };
  }
  render() {
    const initialValue = this.props.initialValue ? this.props.initialValue : {
      name: '',
      shortName: '',
      order: undefined,
      description: '',
      eventBefore: [],
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
                  <Form.Item validateStatus={context.errors.name ? 'error' : undefined} help={context.errors.name}>
                    <Input
                      value={context.values.name}
                      onChange={context.handleChange}
                      /*prefix={<Icon type='user' />}*/
                      placeholder={translate('lang:name')}
                      name='name'
                    />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item validateStatus={context.errors.shortName ? 'error' : undefined} help={context.errors.shortName}>
                    <Input
                      value={context.values.shortName}
                      onChange={context.handleChange}
                      /*prefix={<Icon type='user' />}*/
                      placeholder={translate('lang:shortName')}
                      name='shortName'
                    />
                  </Form.Item>
                </Col>
                <Col xs={16}>
                  <Form.Item validateStatus={context.errors.description ? 'error' : undefined} help={context.errors.description}>
                    <Input
                      value={context.values.description}
                      onChange={context.handleChange}
                      /*prefix={<Icon type='user' />}*/
                      placeholder={translate('lang:description')}
                      name='description'
                    />
                  </Form.Item>
                </Col>
                <Col xs={8}>
                  <Form.Item validateStatus={context.errors.order ? 'error' : undefined} help={context.errors.order}>
                    <Input
                      value={context.values.order}
                      onChange={context.handleChange}
                      type='number'
                      /*prefix={<Icon type='user' />}*/
                      placeholder={translate('lang:order')}
                      name='order'
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item validateStatus={context.errors.eventBefore ? 'error' : undefined} help={context.errors.eventBefore}>
                    <Select
                      value={context.values.eventBefore}
                      onChange={(value) => context.setFieldValue('eventBefore', value)}
                      /*prefix={<Icon type='user' />}*/
                      mode='multiple'
                      placeholder={translate('lang:eventBefore')}
                    >
                      {this.props.eventConfigs.map((val: any) => {
                        return (
                          <Select.Option value={val._id} key={val._id}>{val.eventName}</Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    validateStatus={context.errors.eventAfter ? 'error' : undefined} help={context.errors.eventAfter}>
                    <Select
                      value={context.values.eventAfter}
                      onChange={(value) => context.setFieldValue('eventAfter', value)}
                      /*prefix={<Icon type='user' />}*/
                      mode='multiple'
                      placeholder={translate('lang:eventAfter')}
                    >
                      {this.props.eventConfigs.map((val: any) => {
                        return (
                          <Select.Option value={val._id} key={val._id}>{val.eventName}</Select.Option>
                        );
                      })}
                    </Select>
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
