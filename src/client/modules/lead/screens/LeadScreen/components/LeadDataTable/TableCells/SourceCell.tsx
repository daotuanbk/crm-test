import React from 'react';
import { SOURCES } from '@common/sources';
import _ from 'lodash';

const sourcesByLabel = _.mapKeys(SOURCES, 'value');

export const SourceCell = (props: any) => {
  const {
    record: {
      source,
    },
  } = props;
  const sourceLabel = _.get(sourcesByLabel, `${source}.label`, '');
  return (
    <span>{sourceLabel}</span>
  );
};
