import React from 'react';
import { Product } from '@client/services/service-proxies';

interface Props {
  record: Product;
}

export const ProductNameCell = (props: Props) => {
  const { record } = props;

  return (
    <span>
      {record.name}
    </span>
  );
};
