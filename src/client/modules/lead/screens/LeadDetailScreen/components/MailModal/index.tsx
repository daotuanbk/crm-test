import React from 'react';
import { Modal, Form, Input, Upload, Button, Icon, Select, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { config } from '@client/config';
import { initStore, withRematch } from '@client/store';
import { LEAD_MESSAGE_DETAIL_DIRECTION_IN, LEAD_CONVERSATION_EMAIL } from '@client/core';
import { EmailTemplate, LeadMessageDetail } from '@client/services/service-proxies';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { translate } from '@client/i18n';
import './styles.less';

interface MailProps {
  sendEmailEffects: (payload: any) => boolean;
  setAttachmentList: (payload: string[]) => void;
  attachmentList: string[];
  data: any;
  recipients?: any;
}

interface NewMessageFormProps extends FormComponentProps, MailProps {
  visible: boolean;
  leadEmailConversation: any;
  recipients?: string[];
  leadConversationIds: string[];
  leadMessageDetail?: LeadMessageDetail;
  readOnly?: boolean;
  subject?: string;
  messageId?: string;
  onCancel: (e: any) => void;
  onCreate: (e: any) => void;
}

interface NewMessageFormState {
  fileList: any[];
  isLoading: boolean;
  emailTemplates: EmailTemplate[];
}

const BaseMailModal = Form.create()(
  class extends React.Component<NewMessageFormProps, NewMessageFormState> {
    recipients: string[];
    html: string;
    editor: any;
    subjectFromTemplate: string;
    templateId?: string;

    constructor(props: any) {
      super(props);
      const {leadMessageDetail} = this.props;
      this.state = {
        fileList: this.props.readOnly ? leadMessageDetail && leadMessageDetail.attachments && leadMessageDetail.attachments.map((item: any) => {
          return {
            uid: item.id,
            name: item.title,
            status: 'done',
            url: `${config.url.main}/temp/attachment/${item.url}`,
          };
        }) as any : [],
        isLoading: false,
        emailTemplates: [],
      };
      this.recipients = this.props.recipients || [];
      this.html = '';
      this.editor = null;
      this.subjectFromTemplate = '';
      this.templateId = undefined;
    }

    async componentDidMount() {
      const emailTemplates = await this.getEmailTemplates() as any;
      this.setState({
        emailTemplates: emailTemplates.data,
      });
    }

    getEmailTemplates = async () => {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.findEmailTemplates(
          '',
          undefined,
          50,
          'createdAt|des',
          undefined,
          undefined,
      );
      return result;
    };

    handleUploadChange = ({ fileList }: any) => {
      this.setState({ fileList: [...fileList] });
    };

    handleOk = async (e: any) => {
      if (this.state.isLoading) return;
      e.preventDefault();
      const form = this.props.form;
      await form.validateFields(async (err: any, values: any) => {
        if (err) {
          return;
        }
        this.setState({
          isLoading: true,
        }, async () => {
          try {
            const emails = {
              recipients: values.recipients,
              content: values.content,
              html: this.editor.innerHTML,
              attachments: this.getAttachmentList(),
              conversationIds: this.props.leadConversationIds,
              direction: LEAD_MESSAGE_DETAIL_DIRECTION_IN,
              channel: LEAD_CONVERSATION_EMAIL,
              inReplyTo: this.props.messageId,
              references : this.props.messageId,
            };
            const isMailSent = await this.props.sendEmailEffects(emails);
            if (isMailSent) {
              form.resetFields();
              this.props.onCancel(e);
            }
            this.setState({isLoading: false});
          } catch (e) {
            this.setState({isLoading: false});
          }
        });
      });
    };

    getAttachmentList() {
      return this.state.fileList.map((attachment) => (attachment.response));
    }

    getInitEmailTemplate = (id: string) => {
      let templateText = '';
      if (this.props.leadMessageDetail) templateText = this.props.leadMessageDetail.html;
      if (id) {
        const template = this.state.emailTemplates.find((item: EmailTemplate) => {
          return item.id === id;
        });
        if (template) templateText = template.text;
      }
      const studentName = this.props.data && this.props.data.contact ? this.props.data.contact.fullName : '';
      return templateText.replace(/@student_name/g, studentName);
    };

    getInitSubjectFromTemplate = (id: string) => {
      let subjectFromTemplate = '';
      if (this.props.leadMessageDetail) subjectFromTemplate = this.props.leadMessageDetail.content || '';
      if (id) {
        const template = this.state.emailTemplates.find((item: EmailTemplate) => {
          return item.id === id;
        }) as any;
        if (template) subjectFromTemplate = template.subject || '';
      }
      const studentName = this.props.data && this.props.data.contact ? this.props.data.contact.fullName : '';
      return subjectFromTemplate.replace(/@student_name/g, studentName);
    }

    updateTemplate = async () => {
      try {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        let templateHtml = this.editor.innerHTML;
        const form = this.props.form;
        await form.validateFields(async (err: any, values: any) => {
          if (err) return;
          let templateSubject = values.content;
          const studentName = this.props.data && this.props.data.contact ? this.props.data.contact.fullName : '';
          if (studentName) {
            const regex = new RegExp(studentName, 'g');
            templateHtml = templateHtml.replace(regex, '@student_name');
            templateSubject = templateSubject.replace(regex, '@student_name');
          }
          if (this.templateId) {
            await serviceProxy.updateEmailTemplate(this.templateId, {
              operation: 'updateDetail',
              payload: {
                text: templateHtml,
                subject: templateSubject,
              },
            });
          }
          message.success(translate('lang:updateSuccess'), 3);
          Modal.destroyAll();
        });
      } catch (err) {
        message.error(err.message || translate('lang:internalError'));
      }
      return true;
    };

    render() {
      const confirmUpdateTemplate = () => {
        if (this.templateId) {
          Modal.confirm({
            title: translate('lang:updateEmailTemplateConfirm'),
            okText: 'Confirm',
            onOk: this.updateTemplate,
          });
        } else {
          message.error(translate('lang:noTemplateSelected'));
        }
      };
      const { visible, onCancel, form, readOnly } = this.props;
      const { getFieldDecorator, setFieldsValue } = form;
      const uploadProps = {
        action: `${config.url.api}/upload-attachment`,
        onChange: this.handleUploadChange,
        multiple: true,
        name: 'attachment',
        disabled: !!readOnly,
      };
      const marginBottom = {marginBottom: '5px'};
      return (
        <div className='compose-wrapper'>
          <Modal
            visible={visible}
            style={{minWidth: '600px'}}
            width={'fit-content'}
            title={this.props.subject ? 'Reply mail' : 'New mail'}
            okText={'Send'}
            onCancel={onCancel}
            onOk={this.handleOk}
            footer={readOnly ? null : [
              <Button type='default' style={{float: 'left'}} onClick={() => confirmUpdateTemplate()}>{translate('lang:updateTemplate')}</Button>,
              <Button key='back' onClick={this.props.onCancel}>{translate('lang:cancel')}</Button>,
              <Button key='submit' type='primary' loading={this.state.isLoading} onClick={this.handleOk}>
                {translate('lang:submit')}
              </Button>,
            ]}
          >
            {
              !readOnly && (
                  <React.Fragment>
                    <div style={marginBottom}>{translate('lang:template')}: </div>
                    <Select
                        placeholder='Select a template'
                        style={{ width: '100%', marginBottom: '25px' }}
                        onChange={(val: string) => {
                          setFieldsValue({html: this.getInitEmailTemplate(val)});
                          setFieldsValue({content: this.getInitSubjectFromTemplate(val)});
                          this.html = this.getInitEmailTemplate(val);
                          this.subjectFromTemplate = this.getInitSubjectFromTemplate(val);
                          this.templateId = val;
                        }}
                    >
                      {
                        this.state.emailTemplates && this.state.emailTemplates.map((item: any) => {
                          return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>;
                        })
                      }
                    </Select>
                  </React.Fragment>
              )
            }
            <div style={marginBottom}>{translate('lang:recipients')}: </div>
            <Form layout='vertical'>
              <Form.Item>
                {getFieldDecorator('recipients', {
                  initialValue: this.props.recipients,
                })(
                    <Select
                        disabled
                        mode='tags'
                        style={{ width: '100%' }}
                        tokenSeparators={[',']}>
                    </Select>,
                )}
              </Form.Item>
              <div style={marginBottom}>{translate('lang:subject')}: </div>
              <Form.Item >
                {getFieldDecorator('content', {
                  initialValue: this.props.subject,
                  rules: [{ required: true, message: translate('lang:validateSubjectRequired') }],
                })(
                  <Input placeholder='Subject' disabled={!!this.props.subject}/>,
                )}
              </Form.Item>
              <div style={marginBottom}>{translate('lang:content')}: </div>
              <Form.Item>
                <div
                    ref={(ele: any) => this.editor = ele}
                  dangerouslySetInnerHTML={{__html: this.html}} contentEditable={true}/>
              </Form.Item>
            </Form>

            <div style={{ width: '40%' }}>
              <Upload {...uploadProps} fileList={this.state.fileList}>
                <Button>
                  <Icon type='upload' /> {readOnly ? translate('lang:attachments') : translate('lang:uploadAttachments')}
                </Button>
              </Upload>
            </div>
          </Modal>
        </div>
      );
    }
  },
);

const mapState = (rootState: any) => {
  return {
    ...rootState.mailModel,
  };
};

const mapDispatch = (rootReducer: any) => {
  return {
    ...rootReducer.mailModel,
  };
};

export const MailModal = withRematch(initStore, mapState, mapDispatch)(BaseMailModal);
