import { validatePayload, ensurePermission } from '@app/core';
import * as yup from 'yup';
import { leadRepository } from '@app/crm';
import { BadRequest } from '@feathersjs/errors';
import { mapKeys } from 'lodash';
import { PERMISSIONS } from '@common/permissions';

export const updateNote = async (req: any, res: any) => {
  try {
    const { id, noteId, authUser } = req.params;

    ensurePermission(authUser, PERMISSIONS.LEADS.EDIT);

    const data = req.body;

    await validatePayload({
      content: yup.string()
        .required('Note content cant empty'),
    }, data);

    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new BadRequest('Lead not found');
    }

    const notesById = mapKeys(lead.notes, '_id');
    const note = notesById[noteId];
    if (!note) {
      throw new BadRequest('Note not found');
    }

    note.content = data.content;
    await leadRepository.update({
      id,
      notes: lead.notes,
    });
    res.status(200).end();
  } catch (error) {
    res.status(error.code || 500).json(error.message || req.t('internalServerError'));
  }
};
