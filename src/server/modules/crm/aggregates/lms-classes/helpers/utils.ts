import { ignoreEmptyField, createSearchSetter, createAutoSetter } from '@app/core';
import _ from 'lodash';

export const DB_QUERY_SETTER_DICT = {
  search: ignoreEmptyField(createSearchSetter(true)),
  lmsCourse: createAutoSetter('lmsCourse.$in'),
};
