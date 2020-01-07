import React from 'react';
import { Modal, Form, Row, Col, Select } from 'antd';
import { FormikContext, Formik } from 'formik';
import { Centre, User } from '@client/services/service-proxies';
// import * as yup from 'yup';
import { translate } from '@client/i18n';

/*const editValidationSchema = yup.object().shape({
    centreId: yup.string().required('Centre is required'),
});*/

interface Props {
  title: string;
  visible: boolean;
  handleSubmit: (centreId: string, selectedUsers: string[], formikBag: any) => void;
  closeModal: () => void;
  loading: boolean;
  users: User[];
  centres: Centre[];
}
interface State {
  centreId: string;
}
export class CreateSalesmanModal extends React.Component<Props, State> {
  initialValue: any;
  constructor(props: Props) {
    super(props);

    this.state = {
      centreId: '',
    };

    this.initialValue = {
      centreId: '',
      selectedUsers: [],
    };
  }

  render() {
    return (
      <Formik
        initialValues={this.initialValue}
        /*validationSchema={editValidationSchema}*/
        onSubmit={async (values, formikBag: any) => {
          this.props.handleSubmit(values.centreId, values.selectedUsers, formikBag);
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
                  {translate('lang:selectUsers')}<br />
                  <Form.Item validateStatus={context.errors.name ? 'error' : undefined} help={context.errors.name}>
                    <Select
                      mode='tags'
                      style={{ width: '100%' }}
                      onChange={(ids: string[]) => {
                        context.setFieldValue('selectedUsers', ids);
                      }}
                      tokenSeparators={[',']}>
                      {
                        this.props.users.map((item: User) => {
                          return <Select.Option key={item._id}>{item.fullName}</Select.Option>;
                        })
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  {translate('lang:centre')} <br />
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    validateStatus={context.errors.centreId ? 'error' : undefined} help={context.errors.centreId}>
                    <Select
                      placeholder={translate('lang:selectACenter')}
                      style={{ width: 200 }}
                      onChange={(val: string) => {
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
              </Row>
            </Form>
          </Modal>
        )}
      </Formik>
    );
  }
}
