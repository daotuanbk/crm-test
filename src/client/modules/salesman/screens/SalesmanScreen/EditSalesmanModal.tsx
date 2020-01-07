import React from 'react';
import { Modal, Form, Row, Col, Select } from 'antd';
// import * as yup from 'yup';
import { FormikContext, Formik } from 'formik';
import { Centre } from '@client/services/service-proxies';
import { validateField } from '@client/core';
import * as yup from 'yup';
import { translate } from '@client/i18n';

interface Props {
  title: string;
  visible: boolean;
  handleSubmit: (centreId: string, formikBag: any) => void;
  closeModal: () => void;
  loading: boolean;
  centres: Centre[];
  centreId: string | null;
}
interface State {
  centreId: string;
}
export class EditSalesmanModal extends React.Component<Props, State> {
  initialValue: any;
  constructor(props: Props) {
    super(props);

    this.state = {
      centreId: '',
    };

    this.initialValue = {
      centreId: this.props.centreId,
    };
  }

  render() {
    const editValidationSchema = yup.object().shape({
      centreId: yup.string().required(translate('lang:validateCentreRequired')),
    });
    return (
      <Formik
        initialValues={this.initialValue}
        validationSchema={editValidationSchema}
        onSubmit={async (values, _formikBag: any) => {
          this.props.handleSubmit(values.centreId, _formikBag);
        }}
        validateOnChange={false}
      >
        {(context: FormikContext<any>) => (
          <Modal
            title={this.props.title}
            visible={this.props.visible}
            onOk={() => {
              context.handleSubmit();
            }}
            onCancel={this.props.closeModal}
            confirmLoading={this.props.loading}
          >
            <Form>
              <Row type='flex' gutter={12}>
                <Col xs={24}>
                  {translate('lang:selectACenter')}: <span style={{ color: 'red' }}>*</span><br />
                  <Form.Item validateStatus={context.errors.centreId ? 'error' : undefined} help={context.errors.centreId}>
                    <Select
                      defaultValue={context.values.centreId}
                      placeholder={translate('lang:selectACenter')}
                      style={{ width: 200 }}
                      onBlur={() => validateField({
                        fieldName: 'centreId',
                        validateSchema: editValidationSchema,
                        context,
                      })}
                      onChange={(val: string) => {
                        this.setState({ centreId: val });
                        context.setFieldValue('centreId', val);
                      }}>
                      {
                        this.props.centres && this.props.centres.map((centre: Centre) => {
                          return <Select.Option key={centre._id} value={centre._id}>{centre.name}</Select.Option>;
                        })
                      }
                    </Select>,
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
