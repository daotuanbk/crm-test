import React from 'react';
import './RoleModal.less';
import { Modal, Form, Input, Table, Tag } from 'antd';
import * as yup from 'yup';
import { FormikContext, Formik } from 'formik';
import { validateField } from '../../../../../core';
import { uniq } from 'lodash';
import { getServiceProxy } from '@client/services';

const validationSchema = yup.object().shape({
  name: yup.string().min(2, 'Too short').max(50, 'Too long').matches(/^[a-zA-Z0-9-]*$/, 'Role name can only contain letters, numbers and hyphens').required('Role name is required'),
  description: yup.string().min(2, 'Too short').max(400, 'Too long').required('Role description is required'),
  permissions: yup.array().min(1, 'Permissions is required').required('Permissions is required'),
});

interface Props {
  title: string;
  visible: boolean;
  handleSubmit: (values: any, formikBag: any) => void;
  closeModal: () => void;
  initialValue?: {
    name?: string;
    description?: string;
    permissions?: any[];
  };
  permissionsData: any;
  selectedPermissions: string[];
  selectedPermissionsChange: (selectedPermissions: string[]) => void;
  loading: boolean;
}
export const RoleModal = (props: Props) => {
  const initialValue = props.initialValue ? props.initialValue : {
    name: '',
    description: '',
    permissions: [],
  };

  const permissionColumns = [{
    title: 'Permissions',
    dataIndex: 'name',
    key: 'name',
    render: (_text: string, record: any) => <Tag color='geekblue'>{record.name}</Tag>,
  }];

  const getSelectedKey = (permissions: string[], selectedKeys: string[], row: any) => {
    if (row.value.every((item: any) => permissions.indexOf(item) > -1)) {
      selectedKeys.push(row.key);
    }
    if (row.children) {
      row.children.map((child: any) => getSelectedKey(permissions, selectedKeys, child));
    }
  };

  const selectedRowKeys: string[] = [];
  props.permissionsData.forEach((item: any) => {
    getSelectedKey(props.selectedPermissions, selectedRowKeys, item);
  });
  return (
    <Formik
      initialValues={initialValue}
      validationSchema={validationSchema}
      onSubmit={async (values, formikBag) => {
        props.handleSubmit(values, formikBag);
      }}
      validateOnChange={false}
    >
      {(context: FormikContext<any>) => (
        <Modal
          title={props.title}
          visible={props.visible}
          onOk={(e) => props.handleSubmit(e, context)}
          onCancel={props.closeModal}
          okButtonProps={{
            onClick: () => context.handleSubmit(),
          }}
          confirmLoading={props.loading}
        >
          <Form>
            <Form.Item validateStatus={context.errors.name ? 'error' : undefined} help={context.errors.name}>
              <Input
                value={context.values.name}
                onChange={context.handleChange}
                onBlur={async () => {
                  validateField({
                    fieldName: 'name',
                    validateSchema: validationSchema,
                    context,
                  });

                  if (context.values.name) {
                    const serviceProxies = getServiceProxy();
                    const result = await serviceProxies.checkRoleNameExist(context.values.name);
                    if (result.roleNameExist) {
                      context.setFieldError('name', 'Role name has been used');
                    } else {
                      context.setFieldError('name', '');
                    }
                  }
                }}
                placeholder='Role name'
                name='name'
              />
            </Form.Item>

            <Form.Item validateStatus={context.errors.description ? 'error' : undefined} help={context.errors.description}>
              <Input.TextArea
                value={context.values.description}
                onChange={context.handleChange}
                onBlur={() => validateField({
                  fieldName: 'description',
                  validateSchema: validationSchema,
                  context,
                })}
                placeholder='Description'
                name='description'
              />
            </Form.Item>

            <Form.Item
              className='form-roles-without-margin'
              validateStatus={context.errors.permissions && context.errors.permissions.length ? 'error' : undefined}
              help={context.errors.permissions}>
              <Table
                columns={permissionColumns}
                size='small'
                scroll={{ y: 300 }}
                pagination={false}
                defaultExpandAllRows={true}
                rowSelection={{
                  selectedRowKeys,
                  onSelect: (selectedRowKey, selected, _selectedRow) => {
                    let permissions: string[] = props.selectedPermissions;
                    if (selected) {
                      permissions = [...permissions, ...selectedRowKey.value];
                    } else {
                      permissions = permissions.filter((item) => selectedRowKey.value.indexOf(item) === -1);
                    }
                    context.setFieldValue('permissions', uniq(permissions));

                    const newSelectedRowKeys: string[] = [];
                    props.permissionsData.forEach((item: any) => {
                      getSelectedKey(permissions, newSelectedRowKeys, item);
                    });

                    context.setFieldValue('permissions', newSelectedRowKeys);
                    context.setFieldError('permissions', newSelectedRowKeys.length > 0 ? '' : 'Permissions is required');
                    props.selectedPermissionsChange(newSelectedRowKeys as any);
                  },
                }}
                dataSource={props.permissionsData}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </Formik>
  );
};
