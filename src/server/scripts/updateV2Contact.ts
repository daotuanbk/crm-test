import { logger, mongoDatabase } from '@app/core';
import { config } from '@app/config';
import _ from 'lodash';

(async () => {
  try {
    await mongoDatabase.startDatabase(config.database.connectionString);
    const leadRepository = require('../modules/crm').leadRepository;
    const contactRepository = require('../modules/crm').contactRepository;
    const [contacts, leads] = await Promise.all([
      contactRepository.findAll(),
      leadRepository.findAll(),
    ]);

    const updateContactPromises: any[] = [];
    for (const contact of contacts) {
      logger.info('Contact: ', contact._id);

      if (contact.contactRelations && contact._id) {
        const contactRelations = contact.contactRelations;
        if (contactRelations.length > 0) {
          for (const relation of contactRelations) {
            relation.v2Contact = relation._id;
            updateContactPromises.push(contactRepository.update({
              id: contact._id,
              contactRelations,
            }));
          }
        }
      }
    }

    const updateLeadPromises: any[] = [];
    for (const lead of leads) {
      logger.info('Lead: ', lead._id);

      updateLeadPromises.push(leadRepository.update({
        id: lead._id,
        v2Contact: lead.contact._id,
      }));

      if (lead.contactRelations) {
        const relations = lead.contactRelations;

        if (relations.length) {
          const newRelations: any[] = [];
          for (const relation of relations) {
            relation.v2Contact = relation._id;
            newRelations.push(relation);
          }
          updateLeadPromises.push({
            id: lead._id,
            contactRelations: newRelations,
          });
        }
      }
    }

    await Promise.all(updateLeadPromises);
  } catch (error) {
    logger.error('Update lead v2Contact: ', error);
  }

  process.exit();
})();
