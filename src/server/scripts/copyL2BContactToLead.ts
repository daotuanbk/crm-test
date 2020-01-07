import { logger, mongoDatabase } from '@app/core';
import { config } from '@app/config';
import _ from 'lodash';

(async () => {
  try {
    await mongoDatabase.startDatabase(config.database.connectionString);
    const LeadsModel = require('../modules/crm').LeadsModel;
    // const LeadsModel = require('../modules/crm').LeadsModel;
    const ContactModel = require('../modules/crm').ContactModel;

    const L2BContacts = await ContactModel.find({
      currentStatus: 'L2B - Không nghe máy',
    }).lean();

    const createLeadPromises: any[] = [];
    for (const contact of L2BContacts) {
      // logger.info('Contact: ', contact._id);
      const createLead = async () => {
        const lead = await LeadsModel.findOne({
          'contact._id': contact._id,
        });
        if (!lead) {
          logger.info('Contact not in leads, contact_id=', contact._id);
          logger.info('Adding...');
          const newL2BLead = new LeadsModel({
            v2Contact: contact._id,
            centre: {
              _id: contact.centre,
            },
            contact: {
              id: contact._id,
              _id: contact._id,
              firstName: _.get(contact, 'contactBasicInfo.firstName', ''),
              lastName: _.get(contact, 'contactBasicInfo.lastName', ''),
              fullName: _.get(contact, 'contactBasicInfo.fullName', ''),
              phone: _.get(contact, 'contactRelations.0.phone', ''),
              email: _.get(contact, 'contactBasicInfo.email', ''),
            },
            currentStage: 'L2',
            currentStatus: 'L2B - Không nghe máy',
            owner: {
              id: contact.ownerId,
            },
          });
          await newL2BLead.save();
          logger.info('Done');
        } else {
          logger.info('Contact in lead already');
        }
      };
      createLeadPromises.push(createLead());
    }
    await Promise.all(createLeadPromises);
  } catch (error) {
    logger.error('Add L2B Lead', error);
  }
  process.exit();
})();
