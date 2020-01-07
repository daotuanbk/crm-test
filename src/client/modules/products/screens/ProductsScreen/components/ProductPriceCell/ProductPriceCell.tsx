import React from 'react';
import { Product } from '@client/services/service-proxies';
import { formatMoney } from '@client/core';

interface Props {
  record: Product;
}

export const ProductPriceCell = (props: Props) => {
  const { record } = props;

  return (
    <span>
      {formatMoney(record.price)}
    </span>
  );
};
