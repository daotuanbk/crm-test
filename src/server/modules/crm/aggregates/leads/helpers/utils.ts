import moment from 'moment';
import { Reminder } from '../interfaces/Reminder';
import { Appointment } from '../interfaces/Appointment';
import _ from 'lodash';
import { STAGES } from '@common/stages';

const stageByShortName = _.mapKeys(STAGES, 'shortName');

import {
  LEAD_REMINDER_STATUS_ACTIVE,
  LEAD_APPOINTMENT_WAITING_STATUS,
  LEAD_APPOINTMENT_CANCEL_STATUS,
  LEAD_APPOINTMENT_PASS_STATUS,
  LEAD_APPOINTMENT_FAILED_STATUS,
  createDefaultSort,
  combineSetters,
  createSimpleSetter,
  createAutoSetter,
  ignoreEmptyField,
  createSearchSetter,
} from '@app/core';

// Sort the array so that the latest active reminder is at the begining of the array.
// It's for easier lookup, filter, and sort later
export function sortReminders(reminders: Reminder[]): Reminder[] {
  return reminders.sort((rm1: Reminder, rm2: Reminder): number => {
    // If the reminder is active, give it more digits
    const cmpString1 = rm1.status === LEAD_REMINDER_STATUS_ACTIVE ? '1' : '0' + rm1.dueAt.valueOf().toString();
    const cmpString2 = rm2.status === LEAD_REMINDER_STATUS_ACTIVE ? '1' : '0' + rm2.dueAt.valueOf().toString();
    return cmpString2.localeCompare(cmpString1);
  });
}

export function sortAppointments(appointments: Appointment[]): Appointment[] {
  return appointments.sort((appointment1: Appointment, appointment2: Appointment): number => {
    // If the reminder is active, give it more digits
    const statusPoint = {};
    statusPoint[LEAD_APPOINTMENT_WAITING_STATUS] = '0';
    statusPoint[LEAD_APPOINTMENT_PASS_STATUS] = '1';
    statusPoint[LEAD_APPOINTMENT_FAILED_STATUS] = '1';
    statusPoint[LEAD_APPOINTMENT_CANCEL_STATUS] = '2';

    const cmpString1 = statusPoint[appointment1.currentStatus] + String(new Date(appointment1.time).getTime());
    const cmpString2 = statusPoint[appointment2.currentStatus] + String(new Date(appointment2.time).getTime());

    return cmpString1.localeCompare(cmpString2);
  });
}

const TUIION_QUERY_DICT = {
  '0': {
    'tuition': { '$ne': null },
    'tuition.totalAfterDiscount': { '$gt': 0 },
    '$expr': { '$eq': ['$tuition.totalAfterDiscount', '$tuition.remaining'] },
  },
  '100': {
    'tuition': { '$ne': null },
    'tuition.totalAfterDiscount': { '$gt': 0 },
    'tuition.remaining': 0,
  },
  '0:100': {
    'tuition': { '$ne': null },
    'tuition.totalAfterDiscount': { '$gt': 0 },
    'tuition.remaining': { '$gt': 0 },
    '$expr': { '$gt': ['$tuition.totalAfterDiscount', '$tuition.remaining'] },
  },
};

function tuitionSetter(query: any, value: string) {
  const addedQuery = _.get(TUIION_QUERY_DICT, value, {});
  return _.merge(query, addedQuery);
}

function stageSetter(query: any, stageShortNames: any) {
  const stage = _.pick(stageByShortName, stageShortNames);
  const statusShortNames = _(stage).flatMap('statuses').flatMap('shortName').value();
  const extraQuery = {
    v2Status: {
      '$in': statusShortNames,
    },
  };
  return _.merge(query, extraQuery);
}

function ownerSetter(query: any, value: string) {
  let ownerQuery = {};
  if (value === 'no-owner') {
    ownerQuery = {
      'owner.id': {
        '$exists': false,
      },
    };
  }
  else {
    ownerQuery = {
      'owner.id': { '$in' : value },
    };
  }
  return _.merge(query, ownerQuery);
}

function dateFloor(setter: any, returnTimestampNumber?: boolean) {
  return (obj: any, value: any) => {
    const day = moment(value);
    day.subtract(1, 'days');
    day.set('hours', 23);
    day.set('minutes', 59);
    day.set('seconds', 59);

    if (returnTimestampNumber) {
      return setter(obj, day.valueOf());
    }

    return setter(obj, day.toISOString());
  };
}

function dateCeil(setter: any, returnTimestampNumber?: boolean) {
  return (obj: any, value: any) => {
    const day = moment(value);
    day.add(1, 'days');
    day.set('hours', 0);
    day.set('minutes', 0);
    day.set('seconds', 0);

    if (returnTimestampNumber) {
      return setter(obj, day.valueOf());
    }

    return setter(obj, day.toISOString());
  };
}

function centreIdSetter(query: any, value: string) {
  let centreIdQuery = {};
  if (value === 'no-centre') {
    centreIdQuery = {
      'centre._id': {
        '$exists': false,
      },
    };
  } else {
    centreIdQuery = {
      'centre._id': value,
    };
  }
  return _.merge(query, centreIdQuery);
}

export const DB_QUERY_SETTER_DICT = {
  reminderStart: dateFloor(combineSetters(createSimpleSetter('reminders.0.dueAt'), createSimpleSetter('$gte'))),
  reminderEnd: dateCeil(combineSetters(createSimpleSetter('reminders.0.dueAt'), createSimpleSetter('$lte'))),
  appointmentStart: dateFloor(combineSetters(createSimpleSetter('appointments.0.time'), createSimpleSetter('$gte'))),
  appointmentEnd: dateCeil(combineSetters(createSimpleSetter('appointments.0.time'), createSimpleSetter('$lte'))),
  stage: stageSetter,
  status: createAutoSetter('v2Status.$in'),
  channel: createAutoSetter('channel.$in'),
  search: ignoreEmptyField(createSearchSetter()),
  centreId: centreIdSetter,
  owner: ownerSetter,
  tuitionPaidPercent: tuitionSetter,
  product: createSimpleSetter('productOrder.courses._id'),
  createdAtStart: dateFloor(combineSetters(createSimpleSetter('createdAt'), createSimpleSetter('$gte')), true),
  createdAtEnd: dateCeil(combineSetters(createSimpleSetter('createdAt'), createSimpleSetter('$lte')), true),
  lmsCourse: createSimpleSetter('order.productItems.enrollments.course'),
  lmsClass: createSimpleSetter('order.productItems.enrollments.class'),
  lmsEnrollmentStatus: createSimpleSetter('order.productItems.enrollments.status'),
};

export const SORT_FIELD_DICT = {
  reminder: reminderSort,
  appointment: appointmentSort,
  tuitionProgress: tuitionPercentSort,
  tuitionAfterDiscount: tuitionAfterDiscountSort,
  status: createDefaultSort('currentStatus'),
};

function reminderSort(order: number): any {
  return {
    hasReminders: -1,
    'reminders.0.dueAt': order,
  };
}

function appointmentSort(order: number): any {
  return {
    hasAppointments: -1,
    'appointments.0.time': order,
  };
}

function tuitionPercentSort(order: number): any {
  return {
    hasTuition: -1,
    'tuition.completePercent': order,
  };
}

function tuitionAfterDiscountSort(order: number): any {
  return {
    hasTuition: -1,
    'tuition.totalAfterDiscount': order,
  };
}
