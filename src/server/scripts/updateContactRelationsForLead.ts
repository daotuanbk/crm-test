import mongoose from 'mongoose';
import { config } from '@app/config';
import { logger } from '@app/core';

const updateOneContactRelation = async (lead: any, leadRepository: any, contactRepository: any) => {
  if (lead && lead.contact && lead.contact._id) {
    const contact = await contactRepository.findOne({ _id: lead.contact._id });

    if (contact) {
      await leadRepository.update({
        id: lead._id,
        contactRelations: contact.contactRelations || [],
      });
    }
  }
};

const processing = async () => {
  try {
    await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
    const leadRepository = require('../modules/crm').leadRepository;
    const contactRepository = require('../modules/crm').contactRepository;

    const leads = await leadRepository.findByCriteria();
    const updateLeadPromises: any[] = [];
    leads.forEach((lead: any) => {
      updateLeadPromises.push(updateOneContactRelation(lead, leadRepository, contactRepository));
    });

    await Promise.all(updateLeadPromises);
  } catch (error) {
    logger.error('Update contact relations for leads: ', error);
  }

  process.exit();

};

processing();
