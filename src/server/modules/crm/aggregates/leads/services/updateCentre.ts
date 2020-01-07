import { ensurePermission } from '@app/core';
import { leadRepository, centreRepository } from '@app/crm';
import { BadRequest } from '@feathersjs/errors';
import { PERMISSIONS } from '@common/permissions';

export const updateCentre = async (id: string, data: any, params: any) => {
  const { authUser } = params;

  ensurePermission(authUser, PERMISSIONS.LEADS.EDIT);

  const lead = await leadRepository.findById(id);
  if (!lead) {
    throw new BadRequest('Lead not found');
  }

  const { newCentreId } = data;

  const centre = await centreRepository.findById(newCentreId);
  if (!centre) {
    throw new BadRequest('Centre not found');
  }

  return await leadRepository.update({
    id,
    centre: {
      _id : centre.id,
      name : centre.name,
      shortName : centre.shortName,
    },
  });
};
