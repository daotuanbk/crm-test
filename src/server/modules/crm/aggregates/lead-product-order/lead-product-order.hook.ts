import {
  Hook, addCreationInfo, addModificationInfo, logApiRequest, authenticate, changeClassStageAndStatusJob,
  ASSIGN_STUDENT_TO_CLASS,
  ACTION_TYPE_CHANGE_CENTER_CLASS,
} from '@app/core';
import { leadProductOrderRepository, emailTemplateConfigRepository, leadHistoryRepository } from '@app/crm';
import moment from 'moment';
import { systemConfigRepository } from '../system-config/system-config.repository';
import zlib from 'zlib';

const checkAutoMail = async (context: any, eventTrigger: string) => {
  const data = context ? context.data : null;
  // Check class stage - status
  if (data && data.operation === 'updateCourses' && data.payload && data.payload.sendAutoMail) {
    const leadPO = await leadProductOrderRepository.findByIdPopulateLead(context.id);
    const deepClonePO = JSON.parse(JSON.stringify(leadPO));
    if (data.payload.index) {
      const course = deepClonePO.courses ? deepClonePO.courses.filter((v: any) => v.index === data.payload.index) : [];
      const filteredCourse = course.length ? course[0] : undefined;
      if (filteredCourse) {
        if (data.payload.stage || data.payload.status) {
          if (data.payload.stage !== filteredCourse.stage || data.payload.status !== filteredCourse.status || eventTrigger === 'eventAfter') {
            // Send mail
            let templateIds = undefined as any;
            if (data.payload.stage && data.payload.stage !== filteredCourse.stage || (data.payload.stage && eventTrigger === 'eventAfter')) {
              const stage = await systemConfigRepository.findClassStageByName(data.payload.stage);
              if (stage && stage.value && stage.value[eventTrigger] && stage.value[eventTrigger].length) {
                templateIds = JSON.parse(JSON.stringify(stage.value[eventTrigger]));
              }
            } else if (data.payload.status) {
              const status = await systemConfigRepository.findClassStatusByName(data.payload.status);
              if (status && status.value && status.value[eventTrigger] && status.value[eventTrigger].length) {
                templateIds = JSON.parse(JSON.stringify(status.value[eventTrigger]));
              }
            }

            if (templateIds && templateIds.length) {
              const templateConfigs = await emailTemplateConfigRepository.findByIds(templateIds);
              if (templateConfigs && templateConfigs.length) {
                const deepCloneConfigs = JSON.parse(JSON.stringify(templateConfigs));
                const totalPromises = deepCloneConfigs.map((templateConfig: any) => {
                  if (templateConfig && templateConfig.data && templateConfig.data.length) {
                    const promises = templateConfig.data.map((templateConf: any) => {
                      const template = templateConf ? templateConf.template : undefined;
                      if (template && template.text && template.subject) {
                        const lead = leadPO.leadId;
                        const studentName = lead.contact ? lead.contact.fullName : '';
                        const courseName = filteredCourse.name || '';
                        const oldStage = filteredCourse.stage || '';
                        const oldStatus = filteredCourse.status || '';
                        const arrangedTime = filteredCourse.arrangedAt ? moment(filteredCourse.arrangedAt).format('DD MMM YYYY, HH:mm') : 'Time not set';
                        const newStage = data.payload.stage ? data.payload.stage : '';
                        const newStatus = data.payload.status ? data.payload.status : '';
                        const rec = templateConf.recipient || '';
                        let recipient = '';
                        if (rec === 'student') {
                          recipient = lead.contact ? lead.contact.email : '';
                        } else if (rec === 'saleman') {
                          recipient = lead.owner && lead.owner.id ? lead.owner.id.email : '';
                        }

                        const html =
                          (data.payload.html && recipient && data.payload.html[templateConfig._id] && data.payload.html[templateConfig._id][recipient] ?
                            zlib.inflateSync(new Buffer(data.payload.html[templateConfig._id][recipient], 'base64')).toString() : template.text).replace(/@student_name/g, studentName)
                              .replace(/@course_name/g, courseName)
                              .replace(/@old_stage/g, oldStage)
                              .replace(/@old_status/g, oldStatus)
                              .replace(/@new_stage/g, newStage)
                              .replace(/@new_status/g, newStatus)
                              .replace(/@time/g, arrangedTime);
                        const subject = (recipient && data.payload.subject && data.payload.subject[templateConfig._id] && data.payload.subject[templateConfig._id][recipient] ?
                          zlib.inflateSync(new Buffer(data.payload.subject[templateConfig._id][recipient], 'base64')).toString() : template.subject).replace(/@student_name/g, studentName)
                          .replace(/@course_name/g, courseName)
                          .replace(/@old_stage/g, oldStage)
                          .replace(/@old_status/g, oldStatus)
                          .replace(/@new_stage/g, newStage)
                          .replace(/@new_status/g, newStatus)
                          .replace(/@time/g, arrangedTime);

                        if (recipient) {
                          return changeClassStageAndStatusJob({
                            recipient,
                            subject,
                            html,
                          });
                        } else {
                          return null;
                        }
                      } else {
                        return null;
                      }
                    });
                    return Promise.all(promises);
                  } else {
                    return null;
                  }
                });
                await Promise.all(totalPromises);
              } else {
                return;
              }
            } else {
              return;
            }
          }
        }
      }
    }
  }
};

const sendAssignNewClassAutoMail = async (context: any) => {
  const data = context ? context.data : null;
    if (data && data.operation === 'updateCourses' && data.payload && data.payload.sendAutoMail) {
    let templateConfig = undefined as any;
    const leadPO = await leadProductOrderRepository.findByIdPopulateLead(context.id);
    const deepClonePO = JSON.parse(JSON.stringify(leadPO));
    if (data.payload.index) {
      const course = deepClonePO.courses ? deepClonePO.courses.filter((v: any) => v.index === data.payload.index) : [];
      const filteredCourse = course.length ? course[0] : undefined;
      if (filteredCourse) {
        templateConfig = await emailTemplateConfigRepository.findByName(ASSIGN_STUDENT_TO_CLASS);
        if (templateConfig && templateConfig.data && templateConfig.data.length) {
          const promises = templateConfig.data.map((templateConf: any) => {
            const template = templateConf ? templateConf.template : undefined;
            if (template && template.text && template.subject) {
              const lead = leadPO.leadId;
              const studentName = lead.contact ? lead.contact.fullName : '';
              const courseName = filteredCourse.name || '';
              const oldStage = filteredCourse.stage || '';
              const oldStatus = filteredCourse.status || '';
              const arrangedTime = filteredCourse.arrangedAt ? moment(filteredCourse.arrangedAt).format('DD MMM YYYY, HH:mm') : 'Time not set';
              const newStage = data.payload.stage ? data.payload.stage : '';
              const newStatus = data.payload.status ? data.payload.status : '';
              const rec = templateConf.recipient || '';
              let recipient = '';
              if (rec === 'student') {
                recipient = lead.contact ? lead.contact.email : '';
              } else if (rec === 'saleman') {
                recipient = lead.owner && lead.owner.id ? lead.owner.id.email : '';
              }

              const html =
                (data.payload.html && recipient && data.payload.html[recipient] ?
                  data.payload.html[recipient] : template.text).replace(/@student_name/g, studentName)
                    .replace(/@course_name/g, courseName)
                    .replace(/@old_stage/g, oldStage)
                    .replace(/@old_status/g, oldStatus)
                    .replace(/@new_stage/g, newStage)
                    .replace(/@new_status/g, newStatus)
                    .replace(/@time/g, arrangedTime)
                    .replace(/@class/g, data.payload && data.payload.class ? data.payload.class : '');
              const subject = (recipient && data.payload.subject && data.payload.subject[recipient] ? data.payload.subject[recipient] : template.subject).replace(/@student_name/g, studentName)
                .replace(/@course_name/g, courseName)
                .replace(/@old_stage/g, oldStage)
                .replace(/@old_status/g, oldStatus)
                .replace(/@new_stage/g, newStage)
                .replace(/@new_status/g, newStatus)
                .replace(/@time/g, arrangedTime)
                .replace(/@class/g, data.payload && data.payload.class ? data.payload.class : '');

              if (recipient) {
                return changeClassStageAndStatusJob({
                  recipient,
                  subject,
                  html,
                });
              } else {
                return null;
              }
            } else {
              return null;
            }
          });
          await Promise.all(promises);
        }
      }
    }
  }
};

const historyLogging = async (context: any) => {
  const data = context.data.payload;
  const operation = context.data.operation;
  const leadPO = await leadProductOrderRepository.findByIdPopulateLead(context.id);

  if (leadPO && operation === 'updateCourses') {
    const deepClonePO = JSON.parse(JSON.stringify(leadPO));
    if (data.index) {
      const course = deepClonePO.courses ? deepClonePO.courses.filter((v: any) => v.index === data.index) : [];
      const filteredCourse = course.length ? course[0] : undefined;
      const lead = leadPO.leadId;
      if (filteredCourse && (!filteredCourse.classId || (filteredCourse.classId !== data.classId))) {
        // Class changing
        await leadHistoryRepository.create({
          actionType: ACTION_TYPE_CHANGE_CENTER_CLASS,
          actionCreatedBy: {
            _id: context.params.authUser ? context.params.authUser._id : undefined,
            name: context.params.authUser ? context.params.authUser.fullName : undefined,
          },
          actionCreatedWhen: Date.now(),
          leadId: lead._id,
          name: lead.contact ? lead.contact.fullName : '',
          currentCentre: lead.centre ? {
            _id: lead.centre._id,
            name: lead.centre.name,
          } : undefined,
          currentStage: lead.currentStage,
          currentStatus: lead.currentStatus,
          currentOwner: lead.owner ? {
            _id: lead.owner.id ? lead.owner.id._id : undefined,
            name: lead.owner.fullName,
          } : undefined,
          fromClass: {
            _id: filteredCourse.classId || undefined,
            name: filteredCourse.class || '',
          },
          toClass: {
            _id: data.classId || undefined,
            name: data.class || '',
          },
        } as any);
      }
    }
  }
};

const leadProductOrderHook: Hook = {
  before: {
    all: [
      authenticate,
      logApiRequest,
      async (context: any) => {
        context.params.repository = leadProductOrderRepository;
      },
    ],
    create: [
      addCreationInfo,
    ],
    patch: [
      addModificationInfo,
      sendAssignNewClassAutoMail,
      historyLogging,
      async (context: any) => await checkAutoMail(context, 'eventBefore'),
    ],
  },
  after: {
    patch: [
      async (context: any) => await checkAutoMail(context, 'eventAfter'),
    ],
  },
};

export default leadProductOrderHook;
