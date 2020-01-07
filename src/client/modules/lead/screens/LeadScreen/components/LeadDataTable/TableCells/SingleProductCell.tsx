import React from 'react';
import _ from 'lodash';

export const SingleProductCell = (props: any) => {
  const {
    record,
  } = props;
  const productName = _.get(record, 'productItem.product.name');
  return (
    <span>{productName}</span>
  );
};
