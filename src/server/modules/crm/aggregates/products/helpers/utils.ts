import { createAutoSetter, ignoreEmptyField, createSearchSetter, createDefaultSort } from '@app/core';
import _ from 'lodash';

const isActiveSetter = (query: any, value: string) => {
  if (value === 'true') {
    return _.merge(query, {isActive: true});
  } else if (value === 'false') {
    return _.merge(query, {isActive: false});
  }
  return query;
};

const limitedCourseSort = (order: number): any => {
  return {
    hasCombo: -1,
    'combo.maxCourses': order,
  };
};

const limitedDurationSort = (order: number): any => {
  return {
    hasSpecial: -1,
    'special.maxDuration': order,
  };
};

export const DB_QUERY_SETTER_DICT = {
  search: ignoreEmptyField(createSearchSetter()),
  type: createAutoSetter('type.$in'),
  category: createAutoSetter('category.$in'),
  productLine: createAutoSetter('productLine.$in'),
  isActive: isActiveSetter,
};

export const SORT_FIELD_DICT = {
  price: createDefaultSort('price'),
  limitedCourse: limitedCourseSort,
  limitedDuration: limitedDurationSort,
};
