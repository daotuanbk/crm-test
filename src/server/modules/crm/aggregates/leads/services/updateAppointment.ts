import {
  validatePayload,
  ensurePermission,
  LEAD_APPOINTMENT_WAITING_STATUS,
  LEAD_APPOINTMENT_CANCEL_STATUS,
  LEAD_APPOINTMENT_FAILED_STATUS,
  LEAD_APPOINTMENT_PASS_STATUS,
} from '@app/core';
import * as yup from 'yup';
import { BadRequest } from '@feathersjs/errors';
import { mapKeys } from 'lodash';
import { leadRepository } from '@app/crm';
import { sortAppointments } from '../helpers/utils';
import { PERMISSIONS } from '@common/permissions';

export const updateAppointment = async (req: any, res: any) => {
  try {
    const { params: { id, appointmentId }, authUser } = req;

    ensurePermission(authUser, PERMISSIONS.LEADS.EDIT);

    const data = req.body;

    await validatePayload({
      currentStatus: yup.string()
        .oneOf([LEAD_APPOINTMENT_WAITING_STATUS, LEAD_APPOINTMENT_CANCEL_STATUS, LEAD_APPOINTMENT_FAILED_STATUS, LEAD_APPOINTMENT_PASS_STATUS], 'Invalid appointment status'),
    }, data);

    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new BadRequest('Lead not found');
    }

    const appointmentsById = mapKeys(lead.appointments, '_id');
    const appointment = appointmentsById[appointmentId];
    if (!appointment) {
      throw new BadRequest('Appointment not found');
    }
    if ([LEAD_APPOINTMENT_WAITING_STATUS, LEAD_APPOINTMENT_PASS_STATUS].indexOf(appointment.currentStatus) === -1) {
      throw new BadRequest('Only "Waiting" and "Passed" appointment can be update');
    }

    appointment.currentStatus = data.currentStatus;
    const leadAppointments = sortAppointments(lead.appointments);
    await leadRepository.update({
      id,
      appointments: leadAppointments,
    });
    res.status(200).end();
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
