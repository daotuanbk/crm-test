import _ from 'lodash';

export function combineSetters(...setters: any[]) {
  return (obj: any, value: any) => {
    const addedObj = setters.reduceRight((prevObj, setter) => setter({}, prevObj), value);
    return _.merge(obj, addedObj);
  };
}

export function createAutoSetter(field: string) {
  return (obj: any, value: any) => {
    const newObj = _.cloneDeep(obj);
    _.set(newObj, field, value);
    return newObj;
  };
}

export type StringConverter = (value: string) => string;

export const MakeSearchByWord = (value: string) => {
  return `"${value}"`;
};

export function createSearchSetter(searchByCharacters?: boolean) {
  return (obj: any, value: any) => {
    const newObj = _.cloneDeep(obj);
    if (searchByCharacters) {
      _.set(newObj, '$text.$search', `${value}`);
    } else {
      _.set(newObj, '$text.$search', `"${value}"`);
    }
    return newObj;
  };
}

export function ignoreEmptyField(setter: any) {
  return (obj: any, value: any) => {
    if (!value || value === '') {
      return obj;
    } else {
      return setter(obj, value);
    }
  };
}

export function createSimpleSetter(field: string) {
  return (object: any, value: any) => {
    return _.merge(
      object,
      { [field]: value },
    );
  };
}

export function createDefaultSort(sortField: string) {
  return (order: number): object => {
    return { [sortField]: order };
  };
}

export function toDBQuery(searchParams: any, dbQuerySetterDict: any) {
  return _.reduce(searchParams, (prevQuery, value, field) => {
    const resultSetterOrField = _.get(dbQuerySetterDict, field);
    if (!resultSetterOrField) {
      return prevQuery;
    }
    if (resultSetterOrField instanceof Function) {
      return resultSetterOrField(prevQuery, value);
    } else {
      return createSimpleSetter(resultSetterOrField)(prevQuery, value);
    }
  }, {});
}

export function toDBSort(sortBy: string, sortFieldDict: any): object {
  const localSortBy = sortBy || 'createdAt|des';
  const sortField = localSortBy.split('|')[0];
  const sortOrder = localSortBy.split('|')[1] === 'asc' ? 1 : -1;
  const defaultSort = createDefaultSort(sortField);
  return _.get(sortFieldDict, sortField, defaultSort)(sortOrder);
}
