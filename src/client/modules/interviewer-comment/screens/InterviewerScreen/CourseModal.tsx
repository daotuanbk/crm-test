import React from 'react';
import './InterviewerScreen.less';
import { Button, Modal } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import {
  COURSE_STAGE_CHANGE_TO_NEW, COURSE_STAGE_CHANGE_TO_ARRANGED, COURSE_STAGE_CHANGE_TO_TESTED, COURSE_STAGE_CHANGE_TO_CLOSED,
  COURSE_STATUS_CHANGE_TO_UNSUCCESSFUL, COURSE_STATUS_CHANGE_TO_DEMO_CONFIRMED, COURSE_STATUS_CHANGE_TO_DEMO_UNCONFIRMED, COURSE_STATUS_CHANGE_TO_DEMO_REARRANGED,
  COURSE_STATUS_CHANGE_TO_SUCCESSFUL, COURSE_STATUS_CHANGE_TO_NOT_YET, COURSE_STATUS_CHANGE_TO_PASS, COURSE_STATUS_CHANGE_TO_FAIL, COURSE_STATUS_CHANGE_TO_ABSENT,
  COURSE_STATUS_CHANGE_TO_SKIP, COURSE_STATUS_CHANGE_TO_REGISTERED, COURSE_STATUS_CHANGE_TO_CANCELLED, COURSE_STATUS_CHANGE_TO_TO_NEXT_COURSE_CLASS,
} from '@client/core';
import { translate } from '@client/i18n';
import moment from 'moment';
import { ProgressClassBox } from '@client/modules/lead/screens/LeadDetailScreen/components/ProgressClassBox';

interface State {
  visiblePopover: boolean;
  key: number;
  course: any;
}

interface Props {
  visible: boolean;
  course: any;
  productOrderId?: string;
  contact: any;
  owner: any;
  leadId: string;
  stages: any[];
  statuses: any[];
  centre: any;
  onClose: () => void;
  updateCourse: (payload: string) => void;
}

let editor = {} as any;
export class CourseModal extends React.Component<Props, State> {
  currentComment: string;
  currentStageStatus: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      visiblePopover: false,
      key: new Date().getTime(),
      course: this.props.course,
    };

    this.currentComment = '';
    this.currentStageStatus = {};
  }

  changeStage = async (payload: string, courseId: string) => {
    this.currentStageStatus = {
      ...this.currentStageStatus,
      stage: payload,
      status: '',
      courseId,
    };
    this.setState({
      course: {
        ...this.state.course,
        ...this.currentStageStatus,
      },
    });
    return;
  };

  changeStatus = async (payload: string, courseId: string) => {
    this.currentStageStatus = {
      ...this.currentStageStatus,
      status: payload,
      courseId,
    };
    this.setState({
      course: {
        ...this.state.course,
        ...this.currentStageStatus,
      },
    });
    return;
  };

  saveCourse = async () => {
    const payload = {
      comment: this.currentComment,
      ...this.currentStageStatus,
    };
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    let templateConfig = undefined as any;
    if (payload.status) {
      switch (payload.status) {
        case 'Unsuccessful':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_UNSUCCESSFUL);
          break;
        case 'Demo confirmed':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_DEMO_CONFIRMED);
          break;
        case 'Demo unconfirmed':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_DEMO_UNCONFIRMED);
          break;
        case 'Demo re-arranged':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_DEMO_REARRANGED);
          break;
        case 'Successful':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_SUCCESSFUL);
          break;
        case 'Not yet':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_NOT_YET);
          break;
        case 'Pass':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_PASS);
          break;
        case 'Fail':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_FAIL);
          break;
        case 'Absent':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_ABSENT);
          break;
        case 'Skip':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_SKIP);
          break;
        case 'Registered':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_REGISTERED);
          break;
        case 'Cancelled':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_CANCELLED);
          break;
        case 'To next course / class':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STATUS_CHANGE_TO_TO_NEXT_COURSE_CLASS);
          break;
      }
    } else if (payload.stage) {
      switch (payload.stage) {
        case 'New':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STAGE_CHANGE_TO_NEW);
          break;
        case 'Arranged':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STAGE_CHANGE_TO_ARRANGED);
          break;
        case 'Tested':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STAGE_CHANGE_TO_TESTED);
          break;
        case 'Closed':
          templateConfig = await serviceProxy.findEmailTemplateConfigByName(COURSE_STAGE_CHANGE_TO_CLOSED);
          break;
      }
    }

    if (templateConfig && templateConfig.data) {
      const dataEmail = templateConfig.data.data && templateConfig.data.data.length ? templateConfig.data.data.map((val: any) => {
        const studentName = this.props.contact ? this.props.contact.fullName : '';
        const courseName = this.props.course.name || '';
        const oldStage = this.props.course.stage || '';
        const oldStatus = this.props.course.status || '';
        const arrangedAt = payload.arrangedAt || this.props.course.arrangedAt;
        const arrangedTime = arrangedAt ? moment(this.props.course.arrangedAt).format('DD MMM YYYY, HH:mm') : 'Time not set';
        const html = val.template && val.template.text ? val.template.text.replace(/@student_name/g, studentName)
          .replace(/@course_name/g, courseName)
          .replace(/@old_stage/g, oldStage)
          .replace(/@old_status/g, oldStatus)
          .replace(/@new_stage/g, payload.stage || '')
          .replace(/@new_status/g, payload.status || '')
          .replace(/@time/g, arrangedTime) : '';
        const subject = val.template && val.template.subject ? val.template.subject.replace(/@student_name/g, studentName)
        .replace(/@course_name/g, courseName)
        .replace(/@old_stage/g, oldStage)
        .replace(/@old_status/g, oldStatus)
        .replace(/@new_stage/g, payload.stage || '')
        .replace(/@new_status/g, payload.status || '')
        .replace(/@time/g, arrangedTime) : '';
        let recipient = '';
        if (val.recipient === 'student') {
          recipient = this.props.contact ? this.props.contact.email : '';
        } else if (val.recipient === 'saleman') {
          recipient = this.props.owner && this.props.owner.id ? this.props.owner.id.email : '';
        }
        if (recipient && subject && html) {
          editor[recipient] = null;
          return {
            recipient,
            html,
            subject,
          };
        } else {
          return null;
        }
      }).filter((val: any) => val) : [];

      // const updateTemplate = async (ed: any) => {
      //   try {
      //     const promises = templateConfig.data.data && templateConfig.data.data.length ? templateConfig.data.data.map((val: any) => {
      //       let recipient = '';
      //       if (val.recipient === 'student') {
      //         recipient = this.props.contact ? this.props.contact.email : '';
      //       } else if (val.recipient === 'saleman') {
      //         recipient = this.props.owner && this.props.owner.id ? this.props.owner.id.email : '';
      //       }
      //       if (recipient) {
      //         let templateHtml = ed[recipient] && ed[recipient].innerHTML ? ed[recipient].innerHTML : val.template.text;
      //         const studentName = this.props.contact ? this.props.contact.fullName : '';
      //         const courseName = this.props.course.name || '';
      //         const oldStage = this.props.course.stage || '';
      //         const oldStatus = this.props.course.status || '';
      //         const arrangedAt = payload.arrangedAt || this.props.course.arrangedAt;
      //         const arrangedTime = arrangedAt ? moment(this.props.course.arrangedAt).format('DD MMM YYYY, HH:mm') : 'Time not set';
      //         const newStage = payload.stage || '';
      //         const newStatus = payload.status || '';
      //         if (studentName) {
      //           const regex = new RegExp(studentName, 'g');
      //           templateHtml = templateHtml.replace(regex, '@student_name');
      //         }
      //         if (courseName) {
      //           const regex = new RegExp(courseName, 'g');
      //           templateHtml = templateHtml.replace(regex, '@course_name');
      //         }
      //         if (oldStage) {
      //           const regex = new RegExp(oldStage, 'g');
      //           templateHtml = templateHtml.replace(regex, '@old_stage');
      //         }
      //         if (oldStatus) {
      //           const regex = new RegExp(oldStatus, 'g');
      //           templateHtml = templateHtml.replace(regex, '@old_status');
      //         }
      //         if (arrangedTime) {
      //           const regex = new RegExp(arrangedTime, 'g');
      //           templateHtml = templateHtml.replace(regex, '@time');
      //         }
      //         if (newStage) {
      //           const regex = new RegExp(newStage, 'g');
      //           templateHtml = templateHtml.replace(regex, '@new_stage');
      //         }
      //         if (newStatus) {
      //           const regex = new RegExp(newStatus, 'g');
      //           templateHtml = templateHtml.replace(regex, '@new_status');
      //         }
      //         if (val.template && val.template._id) {
      //           return serviceProxy.updateEmailTemplate(val.template._id, {
      //             operation: 'updateDetail',
      //             payload: {
      //               text: templateHtml,
      //             },
      //           });
      //         }
      //       }
      //       return null;
      //     }) : [];

      //     await Promise.all(promises);
      //     message.success('Update templates successfully!', 3);
      //   } catch (err) {
      //     message.error(err.message || 'Internal server error');
      //   }
      // };

      if (dataEmail && dataEmail.length) {
        Modal.confirm({
          title: 'Auto-mail confirm',
          width: '900px',
          content: <div>
            <h3>{translate('lang:confirmSendAutomail')}</h3>
            <hr></hr>
            <div>
              {dataEmail.map((val: any) => {
                return <div>
                  <h4>{translate('lang:subject')}: {val.subject}</h4>
                  <h4>{translate('lang:recipient')}: {val.recipient}</h4>
                  <h4> {translate('lang:content')}: </h4>
                  <div ref={(ele: any) => editor[val.recipient] = ele} dangerouslySetInnerHTML={{ __html: val.html }} contentEditable={true}/>
                  <hr></hr>
                </div>;
              })}
            </div>
            {/* <Row>
              <Col xs={12}>
                <Button style={{minHeight: '32px', position: 'absolute', bottom: '-56px'}} type='primary' onClick={() => updateTemplate(editor)}>Update template</Button>
              </Col>
            </Row> */}
          </div>,
          okText: translate('lang:send'),
          onOk: async () => {
            for (const property in editor) {
              if (editor.hasOwnProperty(property)) {
                editor[property] = editor[property].innerHTML;
              }
            }
            await this.props.updateCourse({
              ...payload,
              sendAutoMail: true,
              html: editor,
            });
            this.props.onClose();
            editor = {};
          },
          onCancel: async () => {
            await this.props.updateCourse({
              ...payload,
              sendAutoMail: false,
            });
            this.props.onClose();
            editor = {};
          },
        });
      } else {
        await this.props.updateCourse({
          ...payload,
          sendAutoMail: false,
        });
        this.props.onClose();
      }
    } else {
      await this.props.updateCourse({
        ...payload,
        sendAutoMail: false,
      });
      this.props.onClose();
    }
  };

  renderContentPopover = () => {
    const { course } = this.state;
    const content = (
      <div>
        {(
          <ProgressClassBox
            stages={this.props.stages}
            stage={course.stage}
            changeStatus={(payload) => this.changeStatus(payload, course._id)}
            changeStage={(payload) => this.changeStage(payload, course._id)}
            changePropStage={(payload) => this.changeStage(payload, course._id)}
            status={course.status}
            statuses={this.props.statuses}
            readOnly={true}
            arrangedAt={course.arrangedAt}
            centre={this.props.centre}
          />
        )}
        <br />
        {translate('lang:commentsFromInterviewer')}: <br />
        <TextArea
          key={this.state.key}
          autosize={{ minRows: 4, maxRows: 15 }}
          defaultValue={course.comment}
          onChange={(e: any) => {
            this.currentComment = e.target.value;
          }}
          placeholder='Comment' />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <Button style={{ marginRight: '10px' }} onClick={() => {
            this.setState({
              course: this.props.course,
            }, () => {
              this.props.onClose();
            });
          }}>{translate('lang:cancel')}</Button>
          <Button type='primary' onClick={() => this.saveCourse()}>{translate('lang:save')}</Button>
        </div>
      </div>
    );
    return content;
  };

  onTogglePopover = (visible: boolean) => {
    const key = !visible ? new Date().getTime() : this.state.key;
    this.setState({
      visiblePopover: visible,
      key,
    });
  };

  render() {
    const { visible } = this.props;
    if (!visible) return null;

    return (
      <Modal
        onCancel={this.props.onClose}
        title='Basic Modal'
        visible={true}
        footer={null}
        width={900}
      >
        {
          this.renderContentPopover()
        }
      </Modal>
    );
  }
}
