import { IsAuditable } from '@app/core';

export type ReminderStatus = 'Active' | 'Canceled' | 'Completed';

export interface Reminder extends IsAuditable {
  _id?: string;
  title: string;
  dueAt: Date;
  finishedAt?: Date;
  status: ReminderStatus;
}
