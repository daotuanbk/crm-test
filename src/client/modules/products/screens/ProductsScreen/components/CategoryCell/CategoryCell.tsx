import React from 'react';
import { Product } from '@client/services/service-proxies';
import _ from 'lodash';

interface Props {
  record: Product;
}

export const CategoryCell = (props: Props) => {
  const { record } = props;

  return (
    <span>
      {record.category}
    </span>
  );
};
