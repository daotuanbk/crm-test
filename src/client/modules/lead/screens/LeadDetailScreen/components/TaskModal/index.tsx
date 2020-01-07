import React from 'react';
import { Row, Col, Icon, Modal, Input, DatePicker, Form, TimePicker, Button, Popconfirm } from 'antd';
import { Formik, FormikContext } from 'formik';
import moment from 'moment';
import * as yup from 'yup';
import { translate } from '@client/i18n';
import './styles.less';

interface State {}

interface Props {
  initialValue: any;
  handleSubmit: any;
  visible: boolean;
  title: string;
  closeModal: () => void;
  loading: boolean;
  onDelete: (id: string) => void;
}

const addTime = (task: any): object => {
  return {
    ...task,
    day: moment(task.dueAt),
    hour: moment(task.dueAt),
  };
};

const toTask = (task: any): object => {
  return {
    ...task,
    hour: undefined,
    day: undefined,
    dueAt: moment([task.day.year(), task.day.month(), task.day.date(), task.hour.hour(), task.hour.minute(), task.hour.second()]).valueOf(),
  };
};

export class TaskModal extends React.Component<Props, State> {
  initialValue: any;

  constructor(props: Props) {
    super(props);
    this.initialValue = props.initialValue && (props.initialValue._id) ? addTime(props.initialValue) : {
      title: '',
      assigneeId: null,
      day: moment(new Date()),
      hour: moment(new Date()),
    };
  }

  editValidationSchema = yup.object().shape({
    title: yup.string().required(translate('lang:validateNameRequired'))
      .min(2, translate('lang:validateTooShort'))
      .max(50, translate('lang:validateTooLong')),
    day: yup.object().required(translate('lang:validateDayRequired')),
    hour: yup.object().required(translate('lang:validateHourRequired')),
  });

  render() {

    return (
      <Formik
        initialValues={this.initialValue}
        onSubmit={async (values, formikBag: any) => this.props.handleSubmit(toTask(values), formikBag)}
        validationSchema={this.editValidationSchema}
        validate={(values: any) => {
          const errors = {};
          if (!values.day || !values.hour) {
            (errors as any).day = translate('lang:validateDueAtRequired');
          }
          return errors;
        }}
        validateOnChange={false}
      >
        {(context: FormikContext<any>) => (
          <Modal
            title={this.props.title}
            visible={this.props.visible}
            onCancel={this.props.closeModal}
            confirmLoading={this.props.loading}
            footer={(
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  {
                    this.initialValue.title && (
                      <Popconfirm
                        placement='top'
                        title={translate('lang:deleteTaskConfirm')}
                        onConfirm={() => {
                          if (context.values._id && this.props.onDelete) {
                            this.props.onDelete(context.values._id);
                          }
                        }}
                        okText='Yes'
                        cancelText='No'>
                        <Button type='danger'>{translate('lang:delete')}</Button>
                      </Popconfirm>
                    )
                  }
                </span>
                <Button type='primary' onClick={() => {
                  context.handleSubmit();
                }}>Save</Button>
              </div>
            )}
          >
            <Form>
              <Row type='flex' gutter={12}>
                <Col xs={24}>
                  {translate('lang:taskName')} <span style={{ color: 'red' }}>*</span>

                  <br />

                  <Form.Item validateStatus={context.errors.title ? 'error' : undefined} help={context.errors.title}>
                    <Input
                      value={context.values.title}
                      onChange={context.handleChange}
                      prefix={<Icon type='form' />}
                      placeholder={translate('lang:name')}
                      name='title'
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  {translate('lang:dueAt')} <span style={{ color: 'red' }}>*</span>

                  <br />

                  <Form.Item validateStatus={context.errors.day ? 'error' : undefined} help={context.errors.day}>
                    <div style={{ display: 'flex' }}>
                      <DatePicker
                        defaultValue={context.values.day}
                        style={{ marginRight: '10px' }}
                        disabledDate={(endValue: any) => {
                          return endValue.valueOf() < moment().valueOf() - 3600000 * 24;
                        }}
                        format={'DD-MM-YYYY'}
                        onChange={(_date) => {
                          context.setFieldValue('day', _date);
                        }}
                        placeholder={translate('lang:selectDay')}
                      />
                      <TimePicker
                        defaultValue={context.values.hour}
                        placeholder={translate('lang:selectTime')}
                        format={'HH:mm'}
                        onChange={(_time) => {
                          context.setFieldValue('hour', _time);
                        }}
                      />
                    </div>
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
