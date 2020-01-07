// this function helps to get the original filename
import { SOURCES } from '@common/sources';
import _ from 'lodash';

export const getProspectingSourceName = (sourceNumber: number) => {
  const source = _(SOURCES).mapKeys('value').get(sourceNumber);
  return _.get(source, 'N/A');
};
