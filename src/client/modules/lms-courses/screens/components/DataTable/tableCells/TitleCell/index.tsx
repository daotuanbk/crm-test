import React from 'react';
import { LmsCourse } from '@client/services/service-proxies';
import _ from 'lodash';

interface Props {
  record: LmsCourse;
}

export const TitleCell = (props: Props) => {
  const title = _.get(props, 'record.title');

  return (
    <span>
      {title}
    </span>
  );
};
