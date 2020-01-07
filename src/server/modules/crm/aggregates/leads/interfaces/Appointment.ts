import { IsAuditable, ID } from '@app/core';

export type AppointmentStatus = 'WAITING' | 'PASS' | 'FAILED' | 'CANCEL';

export interface Appointment extends IsAuditable {
  _id?: string;
  title: string;
  time: Date;
  centreId: ID;
  currentStatus: AppointmentStatus;
}
