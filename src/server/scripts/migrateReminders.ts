import { logger, mongoDatabase } from '@app/core';
import { config } from '@app/config';
import _ from 'lodash';

(async () => {
  try {
    await mongoDatabase.startDatabase(config.database.connectionString);
    const leadRepository = require('../modules/crm').leadRepository;
    const leads = await leadRepository.findAll();

    const updateLeadPromises: any[] = [];
    for (const lead of leads) {
      if (_.get(lead, 'reminders.length', 0) > 0) {
        updateLeadPromises.push(leadRepository.update({
          id: lead._id,
          hasReminders: true,
        }));
      }
    }
    await Promise.all(updateLeadPromises);
  } catch (error) {
    logger.error('Migrate reminders: ', error);
  }
  process.exit();
})();
