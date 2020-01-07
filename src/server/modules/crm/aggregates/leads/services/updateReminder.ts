import { BadRequest } from '@feathersjs/errors';
import {
  ensurePermission,
  LEAD_REMINDER_STATUS_CANCELED,
  LEAD_REMINDER_STATUS_COMPLETED,
  LEAD_REMINDER_STATUS_ACTIVE,
} from '@app/core';
import { leadRepository } from '@app/crm';
import { mapKeys } from 'lodash';
import { sortReminders } from '../helpers/utils';
import { PERMISSIONS } from '@common/permissions';

export const updateReminder = async (req: any, res: any) => {
  try {
    const { params: { id, reminderId }, authUser } = req;

    ensurePermission(authUser, PERMISSIONS.LEADS.EDIT);

    const data = req.body;

    if (!data.status) {
      throw new BadRequest('`status` must be specified');
    }

    if (data.status !== LEAD_REMINDER_STATUS_CANCELED && data.status !== LEAD_REMINDER_STATUS_COMPLETED) {
      throw new BadRequest('`status` can only changed into `Canceled` or `Completed`');
    }

    const lead = await leadRepository.findById(id);

    if (!lead) {
      throw new BadRequest('Lead is not found');
    }

    const remindersById = mapKeys(lead.reminders, '_id');

    const reminder = remindersById[reminderId];

    if (!reminder) {
      throw new BadRequest('`reminder` not found');
    }

    if (reminder.status !== LEAD_REMINDER_STATUS_ACTIVE) {
      throw new BadRequest('Cannot uppdate reminder that is not `ACTIVE`');
    }

    reminder.status = data.status;

    const sortedReminders = sortReminders(lead.reminders);

    await leadRepository.update({id, reminders: sortedReminders});

    res.status(200).end();
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
