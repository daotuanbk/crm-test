import React from 'react';
import { LmsCourse } from '@client/services/service-proxies';
import _ from 'lodash';

interface Props {
  record: LmsCourse;
}

export const CategoryCell = (props: Props) => {
  const category = _.get(props, 'record.categories.0.title');

  return (
    <span>
      {category || 'N/A'}
    </span>
  );
};
