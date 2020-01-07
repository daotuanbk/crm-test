import { leadRepository } from '@app/crm';
import { LEAD_REMINDER_STATUS_ACTIVE, ensurePermission } from '@app/core';
import { BadRequest } from '@feathersjs/errors';
import { get } from 'lodash';
import { Reminder } from '../interfaces/Reminder';
import { sortReminders } from '../helpers/utils';
import { PERMISSIONS } from '@common/permissions';

export const addReminder = async (req: any, res: any) => {
  try {
    const { params: { id }, authUser } = req;

    ensurePermission(authUser, PERMISSIONS.LEADS.EDIT);

    const data = {
      ...req.body,
      createdAt: new Date().getTime(),
      createdBy: get(req, ['authUser', '_id'], ''),
    };

    // Find the lead
    const lead = await leadRepository.findById(id);
    const reminders = get(lead, 'reminders', []);
    // Are there any reminders?
    if (reminders.length > 0) {
      // Is the latest reminder active?
      const latestReminderStatus = get(reminders, '0.status', null);
      if (latestReminderStatus === LEAD_REMINDER_STATUS_ACTIVE) {
        // YES
        throw new BadRequest('Cannot add reminder when a reminder is still active');
      }
    }

    const dueAt = new Date(data.dueAt);
    // Reminder is older then current time
    if (new Date() > dueAt) {
      throw new BadRequest('Cannot add reminder in the past');
    }

    // Add status field to input data
    const newReminder = {
      ...data,
      status: LEAD_REMINDER_STATUS_ACTIVE,
      dueAt,
    };

    // Merge with current `reminders` array
    const newReminders = [
      ...reminders,
      newReminder,
    ] as Reminder[];

    const sortedNewReminders = sortReminders(newReminders);
    // Update new reminders
    // And also hasReminders for ease of sorting later
    const newLeadInfo = await leadRepository.update({id, reminders: sortedNewReminders, hasReminders: true});

    res.status(201).json(newLeadInfo);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
