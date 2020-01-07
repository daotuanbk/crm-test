import React from 'react';
import { Product } from '@client/services/service-proxies';
import _ from 'lodash';

interface Props {
  record: Product;
}

export const LimitedDurationCell = (props: Props) => {
  const { record } = props;

  return (
    <span>
      {_.get(record, 'special.maxDuration', 'N/A')}
    </span>
  );
};
