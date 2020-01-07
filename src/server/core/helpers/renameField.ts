import _ from 'lodash';

export const renameField = (obj: any, oldFieldName: string, newFieldName: string) => {
  _.set(obj, newFieldName, _.get(obj, oldFieldName));
  _.unset(obj, oldFieldName);
};
