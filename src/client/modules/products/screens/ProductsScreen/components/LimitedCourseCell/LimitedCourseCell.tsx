import React from 'react';
import { Product } from '@client/services/service-proxies';
import _ from 'lodash';

interface Props {
  record: Product;
}

export const LimitedCourseCell = (props: Props) => {
  const { record } = props;

  return (
    <span>
      {_.get(record, 'combo.maxCourses', 'N/A')}
    </span>
  );
};
