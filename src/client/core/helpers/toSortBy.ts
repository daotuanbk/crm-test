import { TableSort } from '@client/components';

export const toSortBy = (sort: TableSort | null) => {
  if (!sort) return undefined;
  const order = {
    'descend': 'desc',
    'ascend': 'asc',
  }[sort.order];
  return `${sort.field}|${order}`;
};
