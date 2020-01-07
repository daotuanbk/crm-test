import React from 'react';
import { Modal, Form, Row, Col, Select } from 'antd';
import { FormikContext, Formik } from 'formik';
import { Centre, User } from '@client/services/service-proxies';
import { translate } from '@client/i18n';
// import * as yup from 'yup';

/*const editValidationSchema = yup.object().shape({
    centreId: yup.string().required('Centre is required'),
});*/

interface Props {
    title: string;
    visible: boolean;
    handleSubmit: (selectedUsers: string[], formikBag: any) => void;
    closeModal: () => void;
    loading: boolean;
    users: User[];
    centres: Centre[];
}
interface State {
    //
}
export class CreateInterviewerModal extends React.Component<Props, State> {
    initialValue: any;
    constructor(props: Props) {
        super(props);

        this.initialValue = {
            selectedUsers: [],
        };
    }

    render() {
        return (
            <Formik
                initialValues={this.initialValue}
                /*validationSchema={editValidationSchema}*/
                onSubmit={async (values, formikBag: any) => {
                    this.props.handleSubmit(values.selectedUsers, formikBag);
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
                                    {translate('lang:selectUsers')}<br/>
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
                            </Row>
                        </Form>
                    </Modal>
                )}
            </Formik>
        );
    }
}
