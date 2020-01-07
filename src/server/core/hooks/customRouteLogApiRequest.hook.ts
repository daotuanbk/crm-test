import { logger, isDev } from '@app/core';
import moment from 'moment';
import _ from 'lodash';

export const customRouteLogApiRequest = async (req: any, _res: any, next: any) => {
  if (isDev) {
    logger.info({
      timestamp: moment().format('DD/MM/YYYY HH:mm'),
      service: req.path,
      method: req.method,
      data: req.body,
      query: req.query,
    });
  }

  next();
};
