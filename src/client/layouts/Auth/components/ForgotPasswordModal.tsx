import React from 'react';
import { Modal, Form, Input, Icon, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import firebase from 'firebase/app';
import 'firebase/auth';
import { initializeFirebaseApp } from '@client/core';
import { translate } from '@client/i18n';

interface Props extends FormComponentProps {
  visible: boolean;
  onCancel: () => void;
}

interface State {
  loading: boolean;
}

class BaseForgotPasswordModal extends React.Component<Props, State> {
  state: State = {
    loading: false,
  };

  render () {
    const handleOk = async () => {
      this.props.form.validateFields((error, values) => {
        if (!error) {
          initializeFirebaseApp();
          firebase.auth().sendPasswordResetEmail(values.email);
          message.success(translate('common:send-reset-password-email-success'));
          this.props.onCancel();
        }
      });
    };

    return (
      <Modal
        title={translate('common:forgotPassword')}
        visible={this.props.visible}
        onOk={handleOk}
        onCancel={this.props.onCancel}
        confirmLoading={this.state.loading}
        okText={translate('common:send-reset-password-email')}
        cancelText={translate('common:cancel')}
      >
        <Form>
          <Form.Item label={translate('common:your-email')}>
            {this.props.form.getFieldDecorator('email', {
              rules: [{ required: true, message: translate('common:pleaseInputEmail') }],
              validateTrigger: 'onBlur',
            })(
              <Input prefix={<Icon type='mail' style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder={translate('common:your-email')} />,
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export const ForgotPasswordModal = Form.create()(BaseForgotPasswordModal);
