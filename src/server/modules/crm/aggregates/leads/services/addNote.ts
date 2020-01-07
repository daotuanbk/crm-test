import { validatePayload, ensurePermission } from '@app/core';
import * as yup from 'yup';
import { leadRepository } from '@app/crm';
import { BadRequest } from '@feathersjs/errors';
import { get } from 'lodash';
import { PERMISSIONS } from '@common/permissions';

export const addNote = async (req: any, res: any) => {
  try {
    const { params: { id }, authUser } = req;

    ensurePermission(authUser, PERMISSIONS.LEADS.EDIT);

    const data = {
      ...req.body,
      createdAt: new Date().getTime(),
      createdBy: get(req, ['authUser', '_id'], ''),
    };

    await validatePayload({
      content: yup.string()
        .required('Note content cant empty'),
    }, data);

    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new BadRequest('Lead not found');
    }

    const notes = get(lead, ['notes'], []);
    const newLeadInfo = await leadRepository.update({id, notes: [...notes, data]}) as any;
    const leadNotes = newLeadInfo.notes;
    res.status(201).json(leadNotes[leadNotes.length - 1]);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
