import { leadRepository } from '@app/crm';
import { get } from 'lodash';

export const updateAvatar = async (req: any, res: any) => {
  try {
    const allLeads = await leadRepository.findByCriteria({}, ['contact._id']);
    const updatePromises: any[] = [];

    allLeads.map((lead) => {
      updatePromises.push(leadRepository.update({
        id: lead._id,
        'contact.avatar': get(lead, 'contact._id.contactBasicInfo.avatar', ''),
      } as any));
    });

    await Promise.all(updatePromises);

    res.status(200).end();
  } catch (error) {
    res.status(error.status || 500).end(error.message || req.t('internalServerError'));
  }
};
