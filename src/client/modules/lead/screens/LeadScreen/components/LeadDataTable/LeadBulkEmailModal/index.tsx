import React from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  Upload,
  Button,
  Icon,
  notification,
} from 'antd';
import { getServiceProxy } from '@client/services';
import firebase from 'firebase';
import { config } from '@client/config';
import _ from 'lodash';
import { withRematch, initStore } from '@client/store';

interface State {
  templates: any[];
  currentTemplate: any;
  isSavingTemplate: boolean;
  fileList: any;
  emailPayload: {
    attachments: any[],
    subject: string,
    html: string,
    bcc: string,
    leads: any[],
  };
}

interface Props {
  visible: boolean;
  leads: any[];
  toggle: () => void;
  onDone: () => void;
}

class BaseLeadBulkEmailModal extends React.Component<Props, State> {
  async componentDidMount() {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const response = await serviceProxy.findEmailTemplates(
      '',
      undefined,
      50,
      'createdAt|des',
      undefined,
      undefined,
    );
    if (response && response.data) {
      this.setState({
        templates: response.data || [],
      });
    }
  }
  state: State = {
    templates: [],
    isSavingTemplate: false,
    currentTemplate: '',
    fileList: [],
    emailPayload: {
      attachments: [],
      subject: '',
      html: '',
      bcc: '',
      leads: [],
    },
  };

  handleChangeTemplate = (_id: string, _option: any) => {
    const currentTemplate = _.mapKeys(this.state.templates, '_id')[_id];
    this.setState({
      ...this.state,
      currentTemplate,
      emailPayload: {
        ...this.state.emailPayload,
        html: currentTemplate.text.replace(/@student_name/g, 'bạn'),
        subject: currentTemplate.subject,
      },
    });
  }

  sendMessage = async () => {
    const { leads } = this.props;
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    await serviceProxy.updateLead(
      '_many',
      {
        operation: 'sendEmail',
        payload: {
          ...this.state.emailPayload,
          subject: this.state.emailPayload.subject,
          leads: leads.map((lead: any) => lead._id),
          bcc: _.get(this.props, 'authUser.email', 'contact@mindx.edu.vn'),
        },
      },
    );
    this.props.toggle();
    notification.success({
      message: 'Send mail success',
      placement: 'bottomRight',
    });
  }
  handleUploadChange = ({ fileList }: any) => {
    this.setState({
      ...this.state,
      fileList: [...fileList],
      emailPayload: {
        ...this.state.emailPayload,
        attachments: fileList.map((file: any) => file.response),
      },
    });
  };

  updatePayloadHTML = (e: any) => {
    this.setState({
      emailPayload: {
        ...this.state.emailPayload,
        html: e.target.innerHTML,
      },
    });
  }

  saveTemplate = async () => {
    const { currentTemplate, emailPayload } = this.state;
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);

    this.setState({ isSavingTemplate: true });

    await serviceProxy.updateEmailTemplate(
      currentTemplate._id,
      {
        operation: 'updateDetail',
        payload: {
          text: emailPayload.html,
          subject: emailPayload.subject,
        },
      },
    );

    this.setState({ isSavingTemplate: false });
    notification.success({
      message: 'Update template success',
      placement: 'bottomRight',
    });
  }

  render() {
    const { visible, toggle, leads } = this.props;
    const { currentTemplate, templates, isSavingTemplate } = this.state;
    const uploadProps = {
      action: `${config.url.api}/upload-attachment`,
      onChange: this.handleUploadChange,
      multiple: true,
      name: 'attachment',
    };
    return (
      <Modal
        visible={visible}
        width='60rem'
        onCancel={toggle}
        footer={[
          <Button
            disabled={!currentTemplate || !currentTemplate._id}
            loading={isSavingTemplate}
            icon='save'
            key='save-template'
            type='primary'
            onClick={this.saveTemplate}
          >
            Save template
          </Button>,
          <Button key='back' onClick={toggle}>
            Cancel
          </Button>,
          <Button key='submit' type='primary' onClick={this.sendMessage}>
            Ok
          </Button>,
        ]}
      >
        <h3 style={{ marginBottom: '2rem' }} >
          Send email to <b>{leads.length}</b> leads
        </h3>
        <Form>
          <h4>Templates:</h4>
          <Form.Item>
            <Select
              value={currentTemplate ? currentTemplate._id : 'Choose a template'}
              onChange={this.handleChangeTemplate}
            >
              {
                templates.map((t: any) => (
                  <Select.Option
                    value={t._id}
                    key={t._id}
                  >
                    {t.name}
                  </Select.Option>
                ))
              }
            </Select>
          </Form.Item>

          <h4>Recipents:</h4>
          <Form.Item>
            <Select
              mode='multiple'
              style={{ width: '100%' }}
              value={leads.map((lead: any) => _.get(lead, 'customer.email'))}
            >
            </Select>
          </Form.Item>

          <h4>Subject:</h4>
          <Form.Item>
            <Input
              placeholder='Enter subject'
              value={this.state.emailPayload.subject}
              onChange={(e: any) => (
                this.setState({
                  emailPayload: {
                    ...this.state.emailPayload,
                    subject: e.target.value,
                  },
                })
              )}
            />
          </Form.Item>

          <h4>Attachments:</h4>
          <Form.Item>
            <Upload {...uploadProps} fileList={this.state.fileList}>
              <Button>
                <Icon type='upload' /> Upload
              </Button>
            </Upload>
          </Form.Item>
          <h4>Content:</h4>
          <Form.Item>
            <div
              dangerouslySetInnerHTML={{__html: this.state.emailPayload.html}}
              contentEditable
              onBlur={this.updatePayloadHTML}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

const mapState = (rootState: any) => {
  return {
    authUser: rootState.profileModel.authUser,
  };
};

const mapDispatch = (_rootReducer: any) => {
  return {};
};

export const LeadBulkEmailModal = withRematch<any>(initStore, mapState, mapDispatch)(BaseLeadBulkEmailModal);
