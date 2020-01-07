import schedule from 'node-schedule';
import {
  leadTaskRepository,
  leadNotificationRepository,
  LeadTask,
  leadAppointmentRepository,
  LeadAppointment,
} from '@app/crm';
import moment from 'moment';
import { LEAD_NOTIFICATION_TYPE_APPOINTMENT, LEAD_NOTIFICATION_TYPE_TASK, logger } from '@app/core';
const LOGGER_NAME = '[Notify-Tasks & Notify-Appointments]';

const start = (_callback: any) => {
  schedule.scheduleJob('*/30 * * * * *', async () => {
    logger.info(`${LOGGER_NAME} Start notify leadTasks & leadAppointments`);
    createOverdueTasks();
    createOverdueAppointments();
  });
};

const createOverdueTasks = async () => {
  logger.info(`${LOGGER_NAME} Find overdue tasks`);
  const overdueItems = await leadTaskRepository.findOverdueRecords();
  const overdueItemIds = overdueItems.map((item: any) => `${item.id}`);
  const existedOverdueItems = await leadNotificationRepository.findByObjectIds(overdueItemIds);
  const addingOverdueItems = [];
  for (const i in overdueItems) {
    let check = false;
    for (const j in existedOverdueItems) {
      if (`${overdueItems[i].id}` === `${existedOverdueItems[j].objectId}`) {
        check = true;
        break;
      }
    }
    if (!check) addingOverdueItems.push(overdueItems[i]);
  }
  logger.info(`${LOGGER_NAME} Need create ${addingOverdueItems.length} overdue tasks`);
  const leadNotifications = addingOverdueItems.map((item: LeadTask) => {
    return leadNotificationRepository.create({
      leadId: `${item.leadId}`,
      content: 'Task: ' + item.title,
      type: LEAD_NOTIFICATION_TYPE_TASK,
      objectId: `${item.id}`,
      objectType: 'LeadTask',
      createdAt: moment().valueOf(),
      ownerId: item.assigneeId,
    } as any);
  });
  await Promise.all(leadNotifications);
  logger.info(`${LOGGER_NAME} Create notify overdue tasks success`);
};

const createOverdueAppointments = async () => {
  logger.info(`${LOGGER_NAME} Find overdue appointments`);
  const overdueItems = await leadAppointmentRepository.findOverdueRecords();
  const overdueItemIds = overdueItems.map((item: any) => `${item.id}`);
  const existedOverdueItems = await leadNotificationRepository.findByObjectIds(overdueItemIds);
  const addingOverdueItems = [];
  for (const i in overdueItems) {
    let check = false;
    for (const j in existedOverdueItems) {
      if (`${overdueItems[i].id}` === `${existedOverdueItems[j].objectId}`) {
        check = true;
        break;
      }
    }
    if (!check) addingOverdueItems.push(overdueItems[i]);
  }
  logger.info(`${LOGGER_NAME} Need create ${addingOverdueItems.length} overdue appointments`);
  const leadNotifications = addingOverdueItems.map((item: LeadAppointment) => {
    return leadNotificationRepository.create({
      leadId: item.leadId,
      content: 'Appointment: ' + item.title,
      type: LEAD_NOTIFICATION_TYPE_APPOINTMENT,
      objectId: `${item.id}`,
      objectType: 'LeadAppointment',
      createdAt: moment().valueOf(),
      ownerId: item.assigneeId,
    } as any);
  });
  await Promise.all(leadNotifications);
  logger.info(`${LOGGER_NAME} Create notify overdue appointments success`);
};
export default { start };
