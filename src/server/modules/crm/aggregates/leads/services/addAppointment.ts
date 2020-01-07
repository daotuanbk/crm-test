import {
  validatePayload,
  LEAD_APPOINTMENT_WAITING_STATUS,
  ensurePermission,
} from '@app/core';
import * as yup from 'yup';
import { centreRepository, leadRepository, LeadStatuses } from '@app/crm';
import { BadRequest } from '@feathersjs/errors';
import { get } from 'lodash';
import { sortAppointments } from '../helpers/utils';
import { PERMISSIONS } from '@common/permissions';

const allowedUpdateStatus = ['L1A', 'L1B', 'L1C', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D'];

export const addAppointment = async (req: any, res: any) => {
  try {
    const { params: { id }, authUser } = req;

    ensurePermission(authUser, PERMISSIONS.LEADS.EDIT);

    const data = {
      ...req.body,
      currentStatus: LEAD_APPOINTMENT_WAITING_STATUS,
      createdAt: new Date().getTime(),
      createdBy: get(req, ['authUser', '_id'], ''),
    };

    await validatePayload({
      time: yup.string()
        .required('Please input appointment time')
        .test('Time not in the past', 'Time cant in the past', (value: string) => {
          const appointmentTime = new Date(value).getTime();
          return appointmentTime > new Date().getTime();
        }),
      centreId: yup.string()
        .required('Please select center')
        .test('Existed Centre', 'Centre didnt exist', async (value: string) => {
          const existedCentre = await centreRepository.findById(value);
          return !!existedCentre;
        }),
      title: yup.string()
        .required('Please input appointment title'),
    }, data);

    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new BadRequest('Lead not found');
    }

    const appointments = get(lead, 'appointments', []);

    // If this is the 1st appointment and v2Status is in L1, L2, L3 => Auto update to L4A
    let updateV2Status = false;
    if (allowedUpdateStatus.indexOf(lead.v2Status) > -1) {
      updateV2Status = true;
    }

    const leadAppointments = sortAppointments([...appointments, data]);
    // Update appointments array
    // Also update hasAppointments for ease of sorting
    const newLeadInfo = await leadRepository.update({
      id,
      appointments: leadAppointments,
      hasAppointments: true,
      v2Status: updateV2Status ? LeadStatuses.L4A : lead.v2Status,
    }) as any;
    res.status(201).json(newLeadInfo);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
