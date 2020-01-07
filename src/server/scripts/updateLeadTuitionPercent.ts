import { logger, mongoDatabase } from '@app/core';
import { config } from '@app/config';
import _ from 'lodash';

(async () => {
  try {
    await mongoDatabase.startDatabase(config.database.connectionString);
    const leadRepository = require('../modules/crm').leadRepository;
    const leads = await leadRepository.findAll();

    const updateLeadPromises: any[] = [];
    for (const item of leads) {
      if (item.tuition) {
        const percent = item.tuition.totalAfterDiscount ? (item.tuition.totalAfterDiscount - item.tuition.remaining) / item.tuition.totalAfterDiscount * 100 : 0;
        updateLeadPromises.push(leadRepository.update({
          id: item._id,
          tuition: {
            ...item.tuition,
            completePercent: Math.round(percent ? percent : 0),
          },
          hasTuition: _.get(item, 'productOrder.courses.length', 0) > 0, // Data redundancy for ease of sorting
        }));
      }
    }

    await Promise.all(updateLeadPromises);
  } catch (error) {
    logger.error('Update lead tuition percent: ', error);
  }

  process.exit();
})();
