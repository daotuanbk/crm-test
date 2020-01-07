import React from 'react';
import moment from 'moment';
import { Popover } from 'antd';
import _ from 'lodash';
import { LeadAppointmentPayloadCurrentStatus } from '@client/services/service-proxies';

const AppointmentPopover = (props: any) => {
  const {
    appointment,
  } = props;
  const color = mapColor(appointment);
  return (
    <div style={{ color }}>
      <h4 style={{ color }}>{appointment.title}</h4>
      <h5 style={{ color }}>Time: {moment(appointment.time).format('DD-MM-YYYY HH:mm:ss')}</h5>
      <h5 style={{ color }}>Current status: {appointment.currentStatus}</h5>
    </div>
  );
};

const mapColor = (appointment: any): string => {
  if (appointment.currentStatus === LeadAppointmentPayloadCurrentStatus.PASS) {
    return 'green';
  } else if (appointment.currentStatus === LeadAppointmentPayloadCurrentStatus.FAILED) {
    return '#262626';
  } else if (appointment.currentStatus === LeadAppointmentPayloadCurrentStatus.CANCEL) {
    return 'lightgray';
  } else {
    // WAITING
    const now = moment();
    const appointmentTime = moment(appointment.time);
    const diff = now.diff(appointmentTime);
    const diff2 = now.diff(appointmentTime, 'days');
    if (diff >= 0) return 'red';
    else if (diff2 === 0) {
      return '#faad14';
    }
    return 'black';
  }
};

export const AppointmentCell = (props: any) => {
  const {
    record,
  } = props;
  const appointment = _.get(record, 'appointments.0');
  if (!appointment) {
    return <span>N/A</span>;
  }
  const color = mapColor(appointment);
  return (
    <Popover trigger='hover' content={<AppointmentPopover appointment={appointment} />}>
      <span style={{ color }}>
        {moment(appointment.time).format('DD-MM-YYYY HH:mm:ss')}
      </span>
    </Popover>
  );
};
