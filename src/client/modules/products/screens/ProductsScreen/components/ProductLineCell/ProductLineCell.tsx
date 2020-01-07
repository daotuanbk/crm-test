import React from 'react';
import { Product } from '@client/services/service-proxies';

interface Props {
  record: Product;
}

export const ProductLineCell = (props: Props) => {
  const { record } = props;

  return (
    <span>
      {record.productLine}
    </span>
  );
};
