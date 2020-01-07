import { ignoreEmptyField, createSearchSetter } from '@app/core';

export const DB_QUERY_SETTER_DICT = {
  search: ignoreEmptyField(createSearchSetter()),
};

export const SORT_FIELD_DICT = {};
