import React from 'react';
import { Modal, Form, Row, Col, Select } from 'antd';
import { FormikContext, Formik } from 'formik';
import _ from 'lodash';
import { Centre, User } from '@client/services/service-proxies';
import { validateField } from '@client/core';
import * as yup from 'yup';
import { translate } from '@client/i18n';

interface Props {
  title: string;
  visible: boolean;
  handleSubmit: (centreId: string, removedSalesmanIds: string[], selectedSalesmanIds: string[], formikBag: any) => void;
  closeModal: () => void;
  loading: boolean;
  salesmen: User[];
  centres: Centre[];
}
interface State {
  centreId: string;
}
export class SalesmanModal extends React.Component<Props, State> {
  initialValue: any;
  defaultSalesmanIds: string[];
  selectedSalesmanIds: string[];
  constructor(props: Props) {
    super(props);

    this.state = {
      centreId: '',
    };

    this.initialValue = {
      centreId: '',
    };
    this.defaultSalesmanIds = [];
    this.selectedSalesmanIds = [];
  }

  onChangeSalesman = (salesmanIds: string[]) => {
    this.selectedSalesmanIds = salesmanIds;
  };

  getDefaultSalesmen = () => {
    const salesmen = this.props.salesmen
      .filter((item: User) => {
        return (item.centreId === this.state.centreId);
      })
      .map((item: User) => item._id);
    this.defaultSalesmanIds = salesmen.length ? salesmen : [];
    return salesmen;
  }

  render() {
    const editValidationSchema = yup.object().shape({
      centreId: yup.string().required(translate('lang:validateCentreRequired')),
    });
    return (
      <Formik
        initialValues={this.initialValue}
        validationSchema={editValidationSchema}
        onSubmit={async (_values, formikBag: any) => {
          const removedSalesmanIds = _.difference(this.defaultSalesmanIds, this.selectedSalesmanIds);
          this.props.handleSubmit(this.state.centreId, removedSalesmanIds, this.selectedSalesmanIds, formikBag);
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
                  {translate('lang:centre')} <span style={{ color: 'red' }}>*</span> <br />
                  <Form.Item
                    style={this.state.centreId ? {} : { marginBottom: 0 }}
                    validateStatus={context.errors.centreId ? 'error' : undefined} help={context.errors.centreId}>
                    <Select
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
                      }}
                    >
                      {
                        this.props.centres && this.props.centres.map((centre: Centre) => {
                          return <Select.Option key={centre._id} value={centre._id}>{centre.name}</Select.Option>;
                        })
                      }
                    </Select>
                  </Form.Item>
                </Col>
                {
                  this.state.centreId && (
                    <Col xs={24} key={this.state.centreId}>
                      {translate('lang:selectSalesman')}<br />
                      <Form.Item
                        style={{ marginBottom: 0 }}
                        validateStatus={context.errors.name ? 'error' : undefined} help={context.errors.name}>
                        <Select
                          mode='tags'
                          style={{ width: '100%' }}
                          onChange={this.onChangeSalesman}
                          tokenSeparators={[',']}
                          defaultValue={this.getDefaultSalesmen()}>
                          {
                            this.props.salesmen.map((item: User) => {
                              if (item.centreId && item.centreId !== this.state.centreId) return null;
                              return <Select.Option key={item._id}>{item.fullName}</Select.Option>;
                            })
                          }
                        </Select>
                      </Form.Item>
                    </Col>
                  )
                }
              </Row>
            </Form>
          </Modal>
        )}
      </Formik>
    );
  }
}
