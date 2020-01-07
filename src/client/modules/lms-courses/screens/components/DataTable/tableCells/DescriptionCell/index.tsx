import React from 'react';
import { LmsCourse } from '@client/services/service-proxies';
import _ from 'lodash';

interface Props {
  record: LmsCourse;
}

export const DescriptionCell = (props: Props) => {
  const description = _.get(props, 'record.description');

  return (
    <span>
      {description}
    </span>
  );
};
