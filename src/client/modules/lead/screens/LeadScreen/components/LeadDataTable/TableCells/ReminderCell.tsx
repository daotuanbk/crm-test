import React from 'react';
import moment from 'moment';
import { Popover } from 'antd';
import _ from 'lodash';
import { LeadReminderUpdatePayloadStatus } from '@client/services/service-proxies';

const ReminderPopover = (props: any) => {
  const {
    reminder,
  } = props;
  const color = reminderColor(reminder);
  return (
    <div style={{ color }}>
      <h4 style={{ color }}><b>{reminder.title}</b></h4>
      <h5 style={{ color }}>Due time: <b>{reminderDueAtString(reminder)}</b></h5>
      <h5 style={{ color }}>Status: <b>{reminder.status}</b></h5>
    </div>
  );
};

// Render reminder color base on status and overdue time
const reminderColor = (reminder: any) => {
  if (reminder.status === LeadReminderUpdatePayloadStatus.Completed) {
    return 'green';
  } else if (reminder.status === LeadReminderUpdatePayloadStatus.Canceled) {
    return 'lightgray';
  } else {
    // Active
    const now = moment();
    const appTime = moment(reminder.dueAt);
    const diff = now.diff(appTime);
    const diff2 = now.diff(appTime, 'days');
    if (diff > 0) {
      return 'red';
    } else if (diff2 > 1) {
      return '#fa8c16';
    }
  }
  return 'black';
};

const reminderDueAtString = (reminder: any): string => {
  return moment(reminder.dueAt).format('DD-MM-YYYY HH:mm:ss');
};

export const ReminderCell = (props: any) => {
  const {
    record,
  } = props;
  const reminder = _.get(record, 'reminders.0');
  if (!reminder) {
    return <span>N/A</span>;
  }
  const color = reminderColor(reminder);
  return (
    <Popover trigger='hover' content={<ReminderPopover reminder={reminder} />}>
       <span style={{ color }}>
          {reminderDueAtString(reminder)}
        </span>
    </Popover>
  );
};
