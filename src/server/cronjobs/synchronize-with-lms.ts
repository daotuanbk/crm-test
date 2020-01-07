import schedule from 'node-schedule';
import {
  logger,
} from '@app/core';
import centreService from '../modules/crm/aggregates/centre/centre.service';
import productCourseService from '../modules/crm/aggregates/product-course/product-course.service';
import classService from '../modules/crm/aggregates/class/class.service';

const LOGGER_NAME = '[Synchronize with LMS]';
const start = (_callback: any) => {
  schedule.scheduleJob('*/30 * * * *', async () => {
    try {
      logger.info(`${LOGGER_NAME} Start to synchronize with LMS`);
      logger.info(`${LOGGER_NAME} Start to synchronize centres`);
      await centreService.synchronize();
      logger.info(`${LOGGER_NAME} Start to synchronize courses`);
      await productCourseService.synchronize();
      logger.info(`${LOGGER_NAME} Start to synchronize classes`);
      await classService.synchronize();
    } catch (e) {
      logger.info(`[Email-conversations] Error when sync email conversation: ${e.message}`);
    }
  });
};
export default { start };
