import React from 'react';
import { ASSIGN_STUDENT_TO_CLASS } from '@client/core';
import { Row, Col, Icon, Modal, message, Input, Button } from 'antd';
import moment from 'moment';
import * as uuid from 'uuid';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import axios from 'axios';
import { config } from '@client/config';
import zlib from 'zlib';
import { translate } from '@client/i18n';
import { get } from 'lodash';
import { Course } from '../Course';
import { SelectComboModal } from '../SelectComboModal';
import { CreateCourseModal } from '../CreateCourseModal';
import { AssignClassModal } from '../AssignClassModal';
import { EditCourseModal } from '../EditCourseModal';
import './styles.less';

interface State {
  editCourseModal: boolean;
  editCourseData: any;
  assignClassModal: boolean;
  assignClassData: any;
  createCourseModal: boolean;
  createCourseData: any;
  selectComboModal: boolean;
  selectComboData: any;
  loading: boolean;
}

interface Props {
  data: any;
  statuses: any;
  stages: any;
  transactions: any;
  courses: any;
  updateCourse: (payload: any, noMessage?: boolean) => Promise<void>;
  changeInput: (payload: any, callback?: any) => void;
  updateRemainingAndTuitionAD: () => Promise<void>;
  checkComboConditionForCourse: (index: number, combo: any, courses: any) => string;
  checkComboCondition: (combo: any, courses: any) => boolean;
  deleteCourse: (payload: any) => Promise<void>;
  addCourse: (payload: any) => Promise<void>;
  addCombo: (payload: any) => Promise<void>;
  removeCombo: () => Promise<void>;
  syncClassLms: (oldClassId: string, newClassId: string) => Promise<void>;
  unknownCourse: any;
  tuitionAD: number;
  classes: any;
  combos: any;
}

let statusEditor = {} as any;
let stageEditor = {} as any;
let statusSubject = {} as any;
let stageSubject = {} as any;
let classEditor = {} as any;
let classSubject = {} as any;

export class ProductOrder extends React.Component<Props, State> {
  state: State = {
    editCourseModal: false,
    editCourseData: {},
    assignClassModal: false,
    assignClassData: {},
    createCourseModal: false,
    createCourseData: {
      _id: undefined,
      index: uuid.v4(),
      discountType: 'PERCENT',
      discountValue: 0,
      stage: 'New',
    },
    selectComboModal: false,
    selectComboData: {},
    loading: false,
  };

  changeStage = async (payload: string, index: string, sendAutoMail?: boolean) => {
    let course = this.props.data.productOrder.courses.filter((val: any) => val.index === index);
    if (course && course.length) {
      course = course[0];
    } else {
      course = undefined;
    }
    this.props.changeInput({
      productOrder: {
        courses: this.props.data.productOrder.courses.map((val: any) => {
          if (val.index === index) {
            return {
              ...val,
              stage: payload,
              status: '',
            };
          } else {
            return val;
          }
        }),
      },
    });

    let templateConfigs = undefined as any;
    let templateIds = undefined as any;
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const stageQuery = await serviceProxy.findClassStageByName(payload);
    const stage = stageQuery ? stageQuery.data : undefined as any;
    if (stage && stage.value && (stage.value.eventBefore && stage.value.eventBefore.length) || (stage.value.eventAfter && stage.value.eventAfter.length)) {
      templateIds = [...JSON.parse(JSON.stringify(stage.value.eventBefore ? stage.value.eventBefore : [])), ...JSON.parse(JSON.stringify(stage.value.eventAfter ? stage.value.eventAfter : []))];
    } else {
      await this.props.updateCourse({
        stage: payload,
        status: '',
        index,
        sendAutoMail,
      });
      return;
    }
    if (templateIds && templateIds.length) {
      const templateConfigResults = await serviceProxy.findEmailTemplateConfigbyIds(templateIds);
      templateConfigs = templateConfigResults ? templateConfigResults.data : undefined;
    } else {
      await this.props.updateCourse({
        stage: payload,
        status: '',
        index,
        sendAutoMail,
      });
      return;
    }

    if (!templateConfigs || !templateConfigs.length) {
      await this.props.updateCourse({
        stage: payload,
        status: '',
        index,
        sendAutoMail,
      });
      return;
    }

    let data = templateConfigs.map((templateConfig: any) => {
      stageEditor[templateConfig._id] = {};
      stageSubject[templateConfig._id] = {};
      if (templateConfig && templateConfig.data && course) {
        return templateConfig.data && templateConfig.data.length ? templateConfig.data.map((val: any) => {
          const studentName = this.props.data.contact ? this.props.data.contact.fullName : '';
          const courseName = course.name || '';
          const oldStage = course.stage || '';
          const oldStatus = course.status || '';
          const arrangedTime = course.arrangedAt ? moment(course.arrangedAt).format('DD MMM YYYY, HH:mm') : translate('lang:timeNotSet');
          const html = val.template && val.template.text ? val.template.text.replace(/@student_name/g, studentName)
            .replace(/@course_name/g, courseName)
            .replace(/@old_stage/g, oldStage)
            .replace(/@old_status/g, oldStatus)
            .replace(/@new_stage/g, payload || '')
            .replace(/@time/g, arrangedTime) : '';
          const subject = val.template && val.template.subject ? val.template.subject.replace(/@student_name/g, studentName)
            .replace(/@course_name/g, courseName)
            .replace(/@old_stage/g, oldStage)
            .replace(/@old_status/g, oldStatus)
            .replace(/@new_stage/g, payload || '')
            .replace(/@time/g, arrangedTime) : '';
          let recipient = '';
          if (val.recipient === 'student') {
            recipient = this.props.data.contact ? this.props.data.contact.email : '';
          } else if (val.recipient === 'saleman') {
            recipient = this.props.data.owner ? this.props.data.owner.email : '';
          }
          if (recipient && html && subject) {
            stageEditor[templateConfig._id][recipient] = null;
            return {
              templateConfigId: templateConfig._id,
              recipient,
              html,
              subject,
            };
          } else {
            return null;
          }
        }).filter((v: any) => v) : [];
      } else {
        return null;
      }
    }).filter((v: any) => v);

    data = [].concat.apply([], data);

    if (data && data.length) {
      Modal.confirm({
        title: translate('lang:automailConfirmTitle'),
        width: '900px',
        content: <div>
          <h3>{translate('lang:automailConfirm')}</h3>
          <hr></hr>
          <div>
            {data.map((val: any) => {
              return <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h4 style={{ marginRight: '10px' }}>{translate('lang:subject')}:</h4>
                  <Input defaultValue={val.subject} onChange={(e: any) => {
                    if (stageSubject[val.templateConfigId]) {
                      stageSubject[val.templateConfigId][val.recipient] = e.target.value;
                    }
                  }}></Input>
                </div>
                <h4>{translate('lang:recipient')}: {val.recipient}</h4>
                <h4> {translate('lang:content')}: </h4>
                <div ref={(ele: any) => stageEditor[val.templateConfigId] ? stageEditor[val.templateConfigId][val.recipient] = ele : null}
                  dangerouslySetInnerHTML={{ __html: val.html }} contentEditable={true} />
                <hr></hr>
              </div>;
            })}
          </div>
          <Row>
            <Col xs={12}>
              <Button style={{ minHeight: '32px', position: 'absolute', bottom: '-56px' }} type='default'
                onClick={() => this.confirmUpdateTemplate(stageEditor, stageSubject, templateConfigs, index, payload)}>{translate('lang:updateTemplate')}</Button>
            </Col>
          </Row>
        </div>,
        okText: 'Confirm',
        onOk: async () => {
          for (const property in stageEditor) {
            if (stageEditor.hasOwnProperty(property)) {
              for (const prop in stageEditor[property]) {
                if (stageEditor[property].hasOwnProperty(prop)) {
                  stageEditor[property][prop] = zlib.deflateSync(stageEditor[property][prop].innerHTML).toString('base64');
                }
              }
            }
          }
          await this.props.updateCourse({
            stage: payload,
            status: '',
            index,
            sendAutoMail: true,
            html: stageEditor,
            subject: stageSubject,
          });
          stageEditor = {};
          stageSubject = {};
        },
        onCancel: async () => {
          await this.props.updateCourse({
            stage: payload,
            status: '',
            index,
            sendAutoMail,
          });
          stageEditor = {};
          stageSubject = {};
        },
      });
    } else {
      await this.props.updateCourse({
        stage: payload,
        status: '',
        index,
        sendAutoMail,
      });
    }
  }

  changePropStage = (payload: string, index: string) => {
    this.props.changeInput({
      productOrder: {
        courses: this.props.data.productOrder.courses.map((val: any) => {
          if (val.index === index) {
            return {
              ...val,
              stage: payload,
              status: '',
            };
          } else {
            return val;
          }
        }),
      },
    });
  }

  updateTemplate = async (editor: any, editorSubject: any, templateConfigs: any, index: string, payload: any) => {
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      let course = this.props.data.productOrder.courses.filter((val: any) => val.index === index);
      if (course && course.length) {
        course = course[0];
      } else {
        course = undefined;
      }
      const totalPromises = templateConfigs.map((templateConfig: any) => {
        const promises = templateConfig.data.data && templateConfig.data.data.length ? templateConfig.data.data.map((val: any) => {
          let recipient = '';
          if (val.recipient === 'student') {
            recipient = this.props.data.contact ? this.props.data.contact.email : '';
          } else if (val.recipient === 'saleman') {
            recipient = this.props.data.owner ? this.props.data.owner.email : '';
          }
          if (recipient) {
            // tslint:disable-next-line
            let templateHtml = editor[templateConfig._id] && editor[templateConfig._id][recipient] && editor[templateConfig._id][recipient].innerHTML ? editor[templateConfig._id][recipient].innerHTML : val.template.text;
            let subject = editor[templateConfig._id] && editorSubject[templateConfig._id][recipient] || val.template.subject;
            const studentName = this.props.data.contact ? this.props.data.contact.fullName : '';
            const courseName = course.name || '';
            const oldStage = course.stage || '';
            const oldStatus = course.status || '';
            const arrangedTime = course.arrangedAt ? moment(course.arrangedAt).format('DD MMM YYYY, HH:mm') : 'Time not set';
            const newStage = payload || '';
            if (studentName) {
              const regex = new RegExp(studentName, 'g');
              templateHtml = templateHtml.replace(regex, '@student_name');
              subject = subject.replace(regex, '@student_name');
            }
            if (courseName) {
              const regex = new RegExp(courseName, 'g');
              templateHtml = templateHtml.replace(regex, '@course_name');
              subject = subject.replace(regex, '@course_name');
            }
            if (oldStage) {
              const regex = new RegExp(oldStage, 'g');
              templateHtml = templateHtml.replace(regex, '@old_stage');
              subject = subject.replace(regex, '@old_stage');
            }
            if (oldStatus) {
              const regex = new RegExp(oldStatus, 'g');
              templateHtml = templateHtml.replace(regex, '@old_status');
              subject = subject.replace(regex, '@old_status');
            }
            if (arrangedTime) {
              const regex = new RegExp(arrangedTime, 'g');
              templateHtml = templateHtml.replace(regex, '@time');
              subject = subject.replace(regex, '@time');
            }
            if (newStage) {
              const regex = new RegExp(newStage, 'g');
              templateHtml = templateHtml.replace(regex, '@new_stage');
              subject = subject.replace(regex, '@new_stage');
            }
            if (val.template && val.template._id) {
              return serviceProxy.updateEmailTemplate(val.template._id, {
                operation: 'updateDetail',
                payload: {
                  text: templateHtml,
                  subject,
                },
              });
            }
          }
          return null;
        }) : [];

        return Promise.all(promises);
      });
      await Promise.all(totalPromises);
      message.success(translate('lang:updateSuccess'), 3);
    } catch (err) {
      message.error(err.message || translate('lang:internalError'));
    }
  };

  confirmUpdateTemplate = (editor: any, subjectEditor: any, templateConfigs: any, index: string, payload: any) => {
    Modal.confirm({
      title: translate('lang:updateTemplateConfirm'),
      okText: 'Confirm',
      onOk: async () => await this.updateTemplate(editor, subjectEditor, templateConfigs, index, payload),
    });
  };

  changeArrangedAt = async (arrangedAt: number, index: string) => {
    try {
      await this.props.updateCourse({
        arrangedAt,
        index,
      }, true);
      const startTime = moment(arrangedAt);
      const endTime = moment(startTime).add(1, 'hours');
      await axios({
        method: 'post',
        url: `${config.lmsApi.api}/slots/create-crm`,
        headers: { 'Content-Type': 'application/json' },
        data: {
          center: this.props.data.centre._id,
          endTime,
          leads: [{
            id: this.props.data._id,
            firstName: this.props.data.contact.firstName ? this.props.data.contact.firstName : '',
            lastName: this.props.data.contact.lastName ? this.props.data.contact.lastName : '',
            fullName: this.props.data.contact.fullName ? this.props.data.contact.fullName : '',
            phone: this.props.data.contact.phone ? this.props.data.contact.phone : '',
            email: this.props.data.contact.email ? this.props.data.contact.email : '',
            address: this.props.data.contact.address ? this.props.data.contact.address : '',
            course: this.props.data.productOrder && this.props.data.productOrder.courses ? this.props.data.productOrder.courses.find((value: any) => value.index === index) : {},
          }],
          startTime,
          title: `Trải nghiệm của ${this.props.data.contact.fullName ? this.props.data.contact.fullName : this.props.data.contact.lastName}`,
          type: 'experiment',
          key: 'tf9peoVGE8',
        },
      });
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
    }
  };

  changeStatus = async (payload: string, index: string) => {
    let course = this.props.data.productOrder.courses.filter((val: any) => val.index === index);
    if (course && course.length) {
      course = course[0];
    } else {
      course = undefined;
    }
    this.props.changeInput({
      productOrder: {
        courses: this.props.data.productOrder.courses.map((val: any) => {
          if (val.index === index) {
            return {
              ...val,
              status: payload,
            };
          } else {
            return val;
          }
        }),
      },
    });

    let templateConfigs = undefined as any;
    let templateIds = undefined as any;
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const statusQuery = await serviceProxy.findClassStatusByName(payload);
    const status = statusQuery ? statusQuery.data : undefined as any;
    if (status && status.value && (status.value.eventBefore && status.value.eventBefore.length) || (status.value.eventAfter && status.value.eventAfter.length)) {
      templateIds = [...JSON.parse(JSON.stringify(status.value.eventBefore ? status.value.eventBefore : [])), ...JSON.parse(JSON.stringify(status.value.eventAfter ? status.value.eventAfter : []))];
    } else {
      await this.props.updateCourse({
        status: payload,
        index,
        sendAutoMail: false,
      });
      return;
    }
    if (templateIds && templateIds.length) {
      const templateConfigResults = await serviceProxy.findEmailTemplateConfigbyIds(templateIds);
      templateConfigs = templateConfigResults ? templateConfigResults.data : undefined;
    } else {
      await this.props.updateCourse({
        status: payload,
        index,
        sendAutoMail: false,
      });
      return;
    }

    if (!templateConfigs || !templateConfigs.length) {
      await this.props.updateCourse({
        status: payload,
        index,
        sendAutoMail: false,
      });
      return;
    }

    let data = templateConfigs.map((templateConfig: any) => {
      statusEditor[templateConfig._id] = {};
      statusSubject[templateConfig._id] = {};
      if (templateConfig && templateConfig.data && course) {
        return templateConfig.data && templateConfig.data.length ? templateConfig.data.map((val: any) => {
          const studentName = this.props.data.contact ? this.props.data.contact.fullName : '';
          const courseName = course.name || '';
          const oldStage = course.stage || '';
          const oldStatus = course.status || '';
          const arrangedTime = course.arrangedAt ? moment(course.arrangedAt).format('DD MMM YYYY, HH:mm') : 'Time not set';
          const newStatus = payload || '';
          const html = val.template && val.template.text ? val.template.text.replace(/@student_name/g, studentName)
            .replace(/@course_name/g, courseName)
            .replace(/@old_stage/g, oldStage)
            .replace(/@old_status/g, oldStatus)
            .replace(/@new_status/g, newStatus)
            .replace(/@time/g, arrangedTime) : '';
          const subject = val.template && val.template.subject ? val.template.subject.replace(/@student_name/g, studentName)
            .replace(/@course_name/g, courseName)
            .replace(/@old_stage/g, oldStage)
            .replace(/@old_status/g, oldStatus)
            .replace(/@new_status/g, newStatus)
            .replace(/@time/g, arrangedTime) : '';
          let recipient = '';
          if (val.recipient === 'student') {
            recipient = this.props.data.contact ? this.props.data.contact.email : '';
          } else if (val.recipient === 'saleman') {
            recipient = this.props.data.owner ? this.props.data.owner.email : '';
          }
          if (recipient && html && subject) {
            statusEditor[templateConfig._id][recipient] = null;
            return {
              templateConfigId: templateConfig._id,
              recipient,
              html,
              subject,
            };
          } else {
            return null;
          }
        }).filter((v: any) => v) : [];
      } else {
        return null;
      }
    }).filter((v: any) => v);

    data = [].concat.apply([], data);

    if (data && data.length) {
      Modal.confirm({
        title: translate('lang:automailConfirmTitle'),
        width: '900px',
        content: <div>
          <h3>{translate('lang:automailConfirm')}</h3>
          <hr></hr>
          <div>
            {data.map((val: any) => {
              return <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h4 style={{ marginRight: '10px' }}>{translate('lang:subject')}:</h4>
                  <Input defaultValue={val.subject} onChange={(e: any) => {
                    if (statusSubject[val.templateConfigId]) {
                      statusSubject[val.templateConfigId][val.recipient] = e.target.value;
                    }
                  }}></Input>
                </div>
                <h4>{translate('lang:recipient')}: {val.recipient}</h4>
                <h4> {translate('lang:content')}: </h4>
                <div ref={(ele: any) => statusEditor[val.templateConfigId] ? statusEditor[val.templateConfigId][val.recipient] = ele : null}
                  dangerouslySetInnerHTML={{ __html: val.html }} contentEditable={true} />
                <hr></hr>
              </div>;
            })}
          </div>
          <Row>
            <Col xs={12}>
              <Button style={{ minHeight: '32px', position: 'absolute', bottom: '-56px' }} type='default'
                onClick={() => this.confirmUpdateTemplate(statusEditor, statusSubject, templateConfigs, index, payload)}>{translate('lang:updateTemplate')}</Button>
            </Col>
          </Row>
        </div>,
        okText: translate('lang:send'),
        onOk: async () => {
          for (const property in statusEditor) {
            if (statusEditor.hasOwnProperty(property)) {
              for (const prop in statusEditor[property]) {
                if (statusEditor[property].hasOwnProperty(prop)) {
                  statusEditor[property][prop] = statusEditor[property][prop].innerHTML;
                }
              }
            }
          }
          await this.props.updateCourse({
            status: payload,
            index,
            sendAutoMail: true,
            html: statusEditor,
            subject: statusSubject,
          });
          statusEditor = {};
          statusSubject = {};
        },
        onCancel: async () => {
          await this.props.updateCourse({
            status: payload,
            index,
            sendAutoMail: false,
          });
          statusEditor = {};
          statusSubject = {};
        },
      });
    } else {
      await this.props.updateCourse({
        status: payload,
        index,
        sendAutoMail: false,
      });
    }
  };

  toggleEditCourseModal = (visible: boolean, record?: any) => {
    this.setState({
      editCourseModal: visible,
      editCourseData: record ? record : {},
    });
  }

  toggleAssignClassModal = (visible: boolean, record?: any) => {
    if (visible) {
      if (!this.props.data.centre) {
        message.error(translate('lang:specifyCentre'), 4);
      } else {
        this.setState({
          assignClassModal: visible,
          assignClassData: record ? record : {},
        });
      }
    } else {
      this.setState({
        assignClassModal: visible,
        assignClassData: record ? record : {},
      });
    }
  }

  toggleCreateCourseModal = (visible: boolean) => {
    this.setState({
      createCourseModal: visible,
    });
  }

  toggleSelectComboModal = (visible: boolean, record?: any) => {
    this.setState({
      selectComboModal: visible,
      selectComboData: record ? record : {},
    });
  }

  selectCourse = (id: string) => {
    const selectedCourse = this.props.courses.filter((val: any) => val && val._id === id);
    if (selectedCourse && selectedCourse.length) {
      this.setState({
        editCourseData: {
          ...this.state.editCourseData,
          _id: selectedCourse[0]._id,
          name: selectedCourse[0].name,
          shortName: selectedCourse[0].shortName,
          tuitionBeforeDiscount: selectedCourse[0].tuitionBeforeDiscount,
          stage: 'New',
        },
      });
    }
  }

  selectClass = async (id: string) => {
    if (id !== 'None') {
      const selectedClass = this.props.classes.filter((val: any) => val._id === id);
      if (selectedClass && selectedClass[0]) {
        this.setState({
          assignClassData: {
            ...this.state.assignClassData,
            classId: id,
            class: selectedClass[0].name,
            startTime: selectedClass[0].startTime ? moment(selectedClass[0].startTime).valueOf() : undefined,
          },
        });
      }
    } else {
      this.setState({
        assignClassData: {
          ...this.state.assignClassData,
          classId: null,
          class: '',
          startTime: null,
        },
      });
    }
  }

  assignClass = async () => {
    this.setState({
      loading: true,
    });

    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const templateConfig = await serviceProxy.findEmailTemplateConfigByName(ASSIGN_STUDENT_TO_CLASS) as any;
    let course = this.props.data.productOrder.courses.filter((value: any) => value.index === this.state.assignClassData.index);
    if (course && course.length) {
      course = course[0];
    } else {
      course = undefined;
    }
    let checkTemplateConfig = false;
    if (templateConfig && templateConfig.data && course) {
      templateConfig.data.data.forEach((value: any) => {
        if (value.template) {
          checkTemplateConfig = true;
        }
      });
    }
    if (checkTemplateConfig && course) {
      const data = templateConfig.data.data && templateConfig.data.data.length ? templateConfig.data.data.map((val: any) => {
        const studentName = this.props.data.contact ? this.props.data.contact.fullName : '';
        const courseName = course.name || '';
        const oldStage = course.stage || '';
        const oldStatus = course.status || '';
        const arrangedTime = course.arrangedAt ? moment(course.arrangedAt).format('DD MMM YYYY, HH:mm') : 'Time not set';
        const newStatus = '';
        const newClass = this.state.assignClassData && this.state.assignClassData.class ? this.state.assignClassData.class : '';
        const html = val.template && val.template.text ? val.template.text.replace(/@student_name/g, studentName)
          .replace(/@course_name/g, courseName)
          .replace(/@old_stage/g, oldStage)
          .replace(/@old_status/g, oldStatus)
          .replace(/@new_status/g, newStatus)
          .replace(/@time/g, arrangedTime)
          .replace(/@class/g, newClass) : '';
        const subject = val.template && val.template.subject ? val.template.subject.replace(/@student_name/g, studentName)
          .replace(/@course_name/g, courseName)
          .replace(/@old_stage/g, oldStage)
          .replace(/@old_status/g, oldStatus)
          .replace(/@new_status/g, newStatus)
          .replace(/@class/g, newClass) : '';
        let recipient = '';
        if (val.recipient === 'student') {
          recipient = this.props.data.contact ? this.props.data.contact.email : '';
        } else if (val.recipient === 'saleman') {
          recipient = this.props.data.owner ? this.props.data.owner.email : '';
        }

        if (html && subject && recipient) {
          classEditor[recipient] = null;
          return {
            recipient,
            html,
            subject,
          };
        } else {
          return null;
        }
      }).filter((v: any) => v) : [];

      const updateTemplate = async (editor: any, editorSubject: any) => {
        try {
          const promises = templateConfig.data.data && templateConfig.data.data.length ? templateConfig.data.data.map((val: any) => {
            let recipient = '';
            if (val.recipient === 'student') {
              recipient = this.props.data.contact ? this.props.data.contact.email : '';
            } else if (val.recipient === 'saleman') {
              recipient = this.props.data.owner ? this.props.data.owner.email : '';
            }
            if (recipient) {
              let templateHtml = editor[recipient] && editor[recipient].innerHTML ? editor[recipient].innerHTML : val.template.text;
              let subject = editorSubject[recipient] || val.template.subject;
              const studentName = this.props.data.contact ? this.props.data.contact.fullName : '';
              const courseName = course.name || '';
              const oldStage = course.stage || '';
              const oldStatus = course.status || '';
              const arrangedTime = course.arrangedAt ? moment(course.arrangedAt).format('DD MMM YYYY, HH:mm') : translate('lang:timeNotSet');
              // const newStatus = payload || '';
              const newStatus = '';
              const newClass = this.state.assignClassData && this.state.assignClassData.class ? this.state.assignClassData.class : '';
              if (studentName) {
                const regex = new RegExp(studentName, 'g');
                templateHtml = templateHtml.replace(regex, '@student_name');
                subject = subject.replace(regex, '@student_name');
              }
              if (courseName) {
                const regex = new RegExp(courseName, 'g');
                templateHtml = templateHtml.replace(regex, '@course_name');
                subject = subject.replace(regex, '@course_name');
              }
              if (oldStage) {
                const regex = new RegExp(oldStage, 'g');
                templateHtml = templateHtml.replace(regex, '@old_stage');
                subject = subject.replace(regex, '@old_stage');
              }
              if (oldStatus) {
                const regex = new RegExp(oldStatus, 'g');
                templateHtml = templateHtml.replace(regex, '@old_status');
                subject = subject.replace(regex, '@old_status');
              }
              if (arrangedTime) {
                const regex = new RegExp(arrangedTime, 'g');
                templateHtml = templateHtml.replace(regex, '@time');
                subject = subject.replace(regex, '@time');
              }
              if (newStatus) {
                const regex = new RegExp(newStatus, 'g');
                templateHtml = templateHtml.replace(regex, '@new_status');
                subject = subject.replace(regex, '@new_status');
              }
              if (newClass) {
                const regex = new RegExp(newClass, 'g');
                templateHtml = templateHtml.replace(regex, '@class');
                subject = subject.replace(regex, '@class');
              }
              if (val.template && val.template._id) {
                return serviceProxy.updateEmailTemplate(val.template._id, {
                  operation: 'updateDetail',
                  payload: {
                    text: templateHtml,
                    subject,
                  },
                });
              }
            }
            return null;
          }) : [];

          await Promise.all(promises);
          message.success(translate('lang:updateSuccess'), 3);
        } catch (err) {
          message.error(err.message || translate('lang:internalError'));
        }
      };

      const confirmUpdateTemplate = (editor: any, editorSubject: any) => {
        Modal.confirm({
          title: translate('lang:updateTemplateConfirm'),
          okText: 'Confirm',
          onOk: async () => await updateTemplate(editor, editorSubject),
        });
      };

      if (data && data.length) {
        Modal.confirm({
          title: translate('lang:automailConfirmTitle'),
          width: '900px',
          content: <div>
            <h3>{translate('lang:automailConfirm')}</h3>
            <hr></hr>
            <div>
              {data.map((val: any) => {
                return <div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h4 style={{ marginRight: '10px' }}>{translate('lang:subject')}:</h4>
                    <Input defaultValue={val.subject} onChange={(e: any) => {
                      classSubject[val.recipient] = e.target.value;
                    }}></Input>
                  </div>
                  <h4>{translate('lang:recipient')}: {val.recipient}</h4>
                  <h4> {translate('lang:content')}: </h4>
                  <div ref={(ele: any) => classEditor[val.recipient] = ele} dangerouslySetInnerHTML={{ __html: val.html }} contentEditable={true} />
                  <hr></hr>
                </div>;
              })}
            </div>
            <Row>
              <Col xs={12}>
                <Button style={{ minHeight: '32px', position: 'absolute', bottom: '-56px' }} type='default' onClick={() => confirmUpdateTemplate(classEditor, classSubject)}>Update template</Button>
              </Col>
            </Row>
          </div>,
          okText: 'Send',
          onOk: async () => {
            for (const property in classEditor) {
              if (classEditor.hasOwnProperty(property)) {
                classEditor[property] = classEditor[property].innerHTML;
              }
            }
            await this.props.updateCourse({
              ...this.state.assignClassData,
              sendAutoMail: true,
              html: classEditor,
              subject: classSubject,
            });
            classEditor = {};
            classSubject = {};
            const oldClass = this.props.data.productOrder.courses.filter((val: any) => {
              return val.index && this.state.assignClassData.index && val.index === this.state.assignClassData.index;
            });
            let oldClassId = undefined as any;
            if (oldClass && oldClass.length) {
              oldClassId = oldClass[0].classId;
            }
            const newClassId = this.state.assignClassData ? this.state.assignClassData.classId : undefined;
            this.props.changeInput({
              productOrder: {
                courses: this.props.data.productOrder.courses.map((val: any) => {
                  if (val.index && this.state.assignClassData.index && val.index === this.state.assignClassData.index) {
                    return this.state.assignClassData;
                  } else {
                    return val;
                  }
                }),
              },
            });
            await this.props.syncClassLms(oldClassId, newClassId);
            this.setState({
              assignClassData: {},
              assignClassModal: false,
              loading: false,
            });
          },
          onCancel: async () => {
            await this.props.updateCourse({
              ...this.state.assignClassData,
              sendAutoMail: false,
            });
            classEditor = {};
            classSubject = {};
            const oldClass = this.props.data.productOrder.courses.filter((val: any) => {
              return val.index && this.state.assignClassData.index && val.index === this.state.assignClassData.index;
            });
            let oldClassId = undefined as any;
            if (oldClass && oldClass.length) {
              oldClassId = oldClass[0].classId;
            }
            const newClassId = this.state.assignClassData ? this.state.assignClassData.classId : undefined;
            this.props.changeInput({
              productOrder: {
                courses: this.props.data.productOrder.courses.map((val: any) => {
                  if (val.index && this.state.assignClassData.index && val.index === this.state.assignClassData.index) {
                    return this.state.assignClassData;
                  } else {
                    return val;
                  }
                }),
              },
            });
            await this.props.syncClassLms(oldClassId, newClassId);
            this.setState({
              assignClassData: {},
              assignClassModal: false,
              loading: false,
            });
          },
        });
      }
    } else {
      const oldClass = this.props.data.productOrder.courses.filter((val: any) => {
        return val.index && this.state.assignClassData.index && val.index === this.state.assignClassData.index;
      });
      let oldClassId = undefined as any;
      if (oldClass && oldClass.length) {
        oldClassId = oldClass[0].classId;
      }
      const newClassId = this.state.assignClassData ? this.state.assignClassData.classId : undefined;
      this.props.changeInput({
        productOrder: {
          courses: this.props.data.productOrder.courses.map((val: any) => {
            if (val.index && this.state.assignClassData.index && val.index === this.state.assignClassData.index) {
              return this.state.assignClassData;
            } else {
              return val;
            }
          }),
        },
      });
      await this.props.updateCourse({
        ...this.state.assignClassData,
      });
      await this.props.syncClassLms(oldClassId, newClassId);
      this.setState({
        assignClassData: {},
        assignClassModal: false,
        loading: false,
      });
    }
  }

  editCourse = async () => {
    this.setState({
      loading: true,
    });

    this.props.changeInput({
      productOrder: {
        courses: this.props.data.productOrder.courses.map((val: any) => {
          if (val.index && this.state.editCourseData.index && val.index === this.state.editCourseData.index) {
            return this.state.editCourseData;
          } else {
            return val;
          }
        }),
      },
    });
    await this.props.updateCourse({
      ...this.state.editCourseData,
    });
    await this.props.updateRemainingAndTuitionAD();

    this.setState({
      editCourseData: {},
      editCourseModal: false,
      loading: false,
    });
  }

  deleteCourse = async (courseIndex: string) => {
    const courses = this.props.data && this.props.data.productOrder && this.props.data.productOrder.courses ? this.props.data.productOrder.courses : [];
    const newCourses = courses.filter((val: any) => val.index !== courseIndex);
    const combo = this.props.data && this.props.data.productOrder && this.props.data.productOrder.comboId ? this.props.data.productOrder.comboId : undefined;
    if (this.props.checkComboCondition(combo, newCourses)) {
      this.props.changeInput({
        productOrder: {
          courses: newCourses,
        },
      });
    } else {
      this.props.changeInput({
        productOrder: {
          courses: newCourses,
          comboName: '',
          comboId: undefined,
        },
      });
    }
    await this.props.deleteCourse({
      index: courseIndex,
    });
    await this.props.updateRemainingAndTuitionAD();
  }

  changeCourseInput = (id: string) => {
    const course = this.props.courses.filter((val: any) => val._id === id);
    if (course && course.length) {
      this.setState({
        createCourseData: {
          ...this.state.createCourseData,
          ...course[0],
        },
      });
    }
  }

  changeCreateCourseInput = (payload: any) => {
    this.setState({
      createCourseData: {
        ...this.state.createCourseData,
        ...payload,
      },
    });
  }

  createCourse = async () => {
    this.setState({
      loading: true,
    });

    await this.props.addCourse(this.state.createCourseData);
    await this.props.updateRemainingAndTuitionAD();

    this.setState({
      createCourseData: {
        _id: undefined,
        index: uuid.v4(),
        discountType: 'PERCENT',
        discountValue: 0,
        stage: 'New',
      },
      loading: false,
      createCourseModal: false,
    });
  }

  selectCombo = async () => {
    this.setState({
      loading: true,
    });

    if (this.state.selectComboData && this.state.selectComboData._id && this.state.selectComboData._id !== 'None') {
      await this.props.addCombo({
        comboId: this.state.selectComboData._id,
        comboName: this.state.selectComboData.name,
      });
      this.props.changeInput({
        productOrder: {
          comboId: this.state.selectComboData,
          comboName: this.state.selectComboData.name,
        },
      });
      await this.props.updateRemainingAndTuitionAD();
      const combo = this.state.selectComboData;
      const courses = this.props.data && this.props.data.productOrder && this.props.data.productOrder.courses ? this.props.data.productOrder.courses : [];
      if (combo.field === 'courseCount') {
        const conditionValue = (combo.condition === 'eq') ? combo.conditionValue : (combo.conditionValue + 1);
        if (courses.length >= conditionValue) {
          //
        } else {
          const courseNeeded = conditionValue - courses.length;
          const unknownCourse = this.props.courses.filter((val: any) => val.shortName === 'UNK');
          if (unknownCourse && unknownCourse.length) {
            const arr = Array.apply(null, { length: courseNeeded } as any).map((_val: any) => {
              return {
                index: uuid.v4(),
                discountType: 'PERCENT',
                discountValue: 0,
                stage: 'New',
                ...unknownCourse[0],
              };
            });
            const promises = arr.map((val: any) => {
              return this.props.addCourse(val);
            });
            await Promise.all(promises);
            this.props.changeInput({
              productOrder: {
                courses: [...this.props.data.productOrder.courses, ...arr],
              },
            });
            await this.props.updateRemainingAndTuitionAD();
          }
        }
      }

      this.setState({
        selectComboData: {
          _id: undefined,
        },
        selectComboModal: false,
        loading: false,
      });
    } else {
      await this.props.removeCombo();
      this.props.changeInput({
        productOrder: {
          comboId: undefined,
          comboName: '',
        },
      });
      await this.props.updateRemainingAndTuitionAD();
      this.setState({
        selectComboData: {
          _id: undefined,
        },
        selectComboModal: false,
        loading: false,
      });
    }
  }

  changeSelectCombo = (id: string) => {
    if (id !== 'None') {
      const combo = this.props.combos.filter((val: any) => val._id === id);
      if (combo && combo.length) {
        this.setState({
          selectComboData: {
            ...this.state.selectComboData,
            ...combo[0],
          },
        });
      }
    } else {
      this.setState({
        selectComboData: {
          _id: undefined,
          name: '',
        },
      });
    }
  }

  render() {
    const combo = this.props.data && this.props.data.productOrder && this.props.data.productOrder.comboId ? this.props.data.productOrder.comboId : undefined;
    const courses = this.props.data && this.props.data.productOrder && this.props.data.productOrder.courses ? this.props.data.productOrder.courses : [];
    const numberOfCourse = combo ? combo.field === 'courseCount' ? Number(combo.conditionValue) || 1 : courses.length : 1;
    const comboDiscount = combo ?
      combo.discountValue && combo.discountType ?
        combo.discountType !== 'FIXED' ? `${combo.discountType === 'PERCENT' ? combo.discountValue : (Number(combo.discountValue) / numberOfCourse).toLocaleString()}
          ${combo.discountType === 'PERCENT' ? '%' : 'VND'}` : `Combo ${combo.name}`
        : ''
      : '';

    return (
      <>
        <div>
          <h3>{translate('lang:productOrder')}</h3>
          <Row>
            <Col xs={24}>
              <p>
                <span className='text-gray' style={{ marginRight: '4px' }}>{translate('lang:discountPack')}:</span>
                <span style={{ color: get(this.props, ['data', 'productOrder', 'comboName'], '') ? '#1890ff' : 'red' }}>
                  {get(this.props, ['data', 'productOrder', 'comboName'], translate('lang:noPack'))}
                </span>
                <Icon
                  type='edit'
                  style={{ fontSize: '16px', cursor: 'pointer', color: '#1890ff', marginLeft: '5px' }}
                  onClick={() => this.toggleSelectComboModal(true, combo)}
                />
              </p>
            </Col>
          </Row>
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <a onClick={() => this.toggleCreateCourseModal(true)}>
              {translate('lang:addCourse')}
            </a>
          </div>
        </div>

        {get(this.props.data, ['productOrder', 'courses', 'length'], 0) ? this.props.data.productOrder.courses.map((val: any, index: number) => {
          return (
            <Course data={val} key={`${val._id}-${index}`} arrangedAt={val.arrangedAt}
              changeArrangedAt={this.changeArrangedAt} changeStage={this.changeStage} changeStatus={this.changeStatus} stages={this.props.stages}
              statuses={this.props.statuses} openEditModal={() => this.toggleEditCourseModal(true, val)}
              deleteCourse={this.deleteCourse} openClassModal={() => this.toggleAssignClassModal(true, val)}
              changePropStage={this.changePropStage}
              centre={this.props.data.centre}
            />
          );
        }) : null}

        <EditCourseModal
          loading={this.state.loading}
          visible={this.state.editCourseModal}
          editCourseData={this.state.editCourseData}
          courses={this.props.courses}
          unknownCourse={this.props.unknownCourse}
          leadInfo={this.props.data}
          editCourse={this.editCourse}
          toggleEditCourseModal={this.toggleEditCourseModal}
          selectCourse={this.selectCourse}
        />

        <AssignClassModal
          leadInfo={this.props.data}
          loading={this.state.loading}
          visible={this.state.assignClassModal}
          assignClassData={this.state.assignClassData}
          classes={this.props.classes}
          assignClass={this.assignClass}
          selectClass={this.selectClass}
          toggleAssignClassModal={this.toggleAssignClassModal}
        />

        <CreateCourseModal
          loading={this.state.loading}
          visible={this.state.createCourseModal}
          createCourseData={this.state.createCourseData}
          checkComboConditionForCourse={this.props.checkComboConditionForCourse}
          courses={this.props.courses}
          combo={combo}
          comboDiscount={comboDiscount}
          createCourse={this.createCourse}
          toggleCreateCourseModal={this.toggleCreateCourseModal}
          changeCourseInput={this.changeCourseInput}
          changeCreateCourseInput={this.changeCreateCourseInput}
        />

        <SelectComboModal
          loading={this.state.loading}
          visible={this.state.selectComboModal}
          selectComboData={this.state.selectComboData}
          combos={this.props.combos}
          selectCombo={this.selectCombo}
          toggleSelectComboModal={this.toggleSelectComboModal}
          changeSelectCombo={this.changeSelectCombo}
        />
      </>
    );
  }
}
