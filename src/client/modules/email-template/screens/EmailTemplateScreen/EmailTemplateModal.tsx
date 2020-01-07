import React from 'react';
import { Modal, Form, Row, Input, Button, Upload, Icon, Select } from 'antd';
// import * as yup from 'yup';
import { FormikContext, Formik } from 'formik';
import * as yup from 'yup';
import { validateField } from '@client/core';
import juice from 'juice';
import { translate } from '@client/i18n';
const Option = Select.Option;

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
}

export const EmailTemplateModal = (props: Props) => {
  let editor: any;
  const initialValue = props.initialValue && ((props.initialValue as any)._id) ? props.initialValue : {
    name: '',
    text: '',
    type: '',
    subject: '',
  };

  const editValidationSchema = yup.object().shape({
    name: yup.string().required(translate('lang:validateNameRequired')).min(2, translate('lang:validateTooShort')).max(80, translate('lang:validateTooLong')),
    text: yup.string().required(translate('lang:validateTextRequired')).min(2, translate('lang:validateTooShort')),
    subject: yup.string().required(translate('lang:validateSubjectRequired')).min(2, translate('lang:validateTooShort')),
  });

  return (
    <Formik
      initialValues={initialValue}
      onSubmit={async (values, formikBag: any) => {
        props.handleSubmit({ ...values, text: editor.innerHTML }, formikBag);
      }}
      validateOnChange={false}
      validationSchema={editValidationSchema}
    >
      {(context: FormikContext<any>) => (
        <Modal
          width={'fit-content'}
          style={{ minWidth: '600px' }}
          title={props.title}
          visible={props.visible}
          onOk={(e) => props.handleSubmit(e, context)}
          onCancel={props.closeModal}
          okButtonProps={{
            onClick: () => context.handleSubmit(),
          }}
          confirmLoading={props.loading}>
          <Form>
            <Row style={{ marginBottom: '10px' }}>
              <Upload
                showUploadList={false}
                beforeUpload={(file: any) => {
                  const reader = new FileReader();
                  reader.onload = ((readerObject: any) => {
                    return () => {
                      const contents = readerObject.result;
                      context.setFieldValue('text', juice(contents));
                    };
                  })(reader);
                  reader.readAsText(file);
                  return false;
                }}>
                <Button>
                  <Icon type='upload' /> {translate('lang:selectFile')}
                </Button>
              </Upload>
            </Row>
            <Row style={{ marginBottom: '10px' }}>
              {translate('lang:name')}:
            </Row>
            <Row type='flex'>
              <Form.Item style={{ width: '100%' }} validateStatus={context.errors.name ? 'error' : undefined} help={context.errors.name}>
                <Input
                  value={context.values.name}
                  onChange={context.handleChange}
                  placeholder={translate('lang:name')}
                  name='name'
                  onBlur={() => validateField({
                    fieldName: 'name',
                    validateSchema: editValidationSchema,
                    context,
                  })}
                />
              </Form.Item>
            </Row>
            <Row style={{ marginBottom: '10px' }}>
              {translate('lang:templateType')}:
                        </Row>
            <Row type='flex'>
              <Form.Item style={{ width: '100%' }} validateStatus={context.errors.type ? 'error' : undefined} help={context.errors.type}>
                <Select defaultValue='other' style={{ width: '100%' }} onChange={(value) => context.setFieldValue('type', value)} >
                  <Option value='before'>Trước khoá học</Option>
                  <Option value='inCourse'>Trong khoá học</Option>
                  <Option value='promotion'>Quảng cáo</Option>
                  <Option value='other'>Khác</Option>
                </Select>
              </Form.Item>
            </Row>
            <Row style={{ marginBottom: '10px' }}>
              {translate('lang:subject')}:
            </Row>
            <Row type='flex'>
              <Form.Item style={{ width: '100%' }} validateStatus={context.errors.subject ? 'error' : undefined} help={context.errors.subject}>
                <Input
                  value={context.values.subject}
                  onChange={context.handleChange}
                  placeholder={translate('lang:subject')}
                  name='subject'
                  onBlur={() => validateField({
                    fieldName: 'subject',
                    validateSchema: editValidationSchema,
                    context,
                  })}
                />
              </Form.Item>
            </Row>
            <Row style={{ marginBottom: '10px' }}>
              {translate('lang:templateForm')}:
                        </Row>
            {context && context.values && context.values.text ?
              <Row type='flex'>
                <div ref={(ele: any) => editor = ele} dangerouslySetInnerHTML={{ __html: context.values.text }} contentEditable={true} />
              </Row> : null}
          </Form>
        </Modal>
      )}
    </Formik>
  );
};
