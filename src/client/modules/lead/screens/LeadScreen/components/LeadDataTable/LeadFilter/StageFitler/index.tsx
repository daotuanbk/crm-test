import React from 'react';
import { MultiSelect } from '@client/components';
import { STAGES } from '@common/stages';
import { valueToOption } from '@client/helpers';
import _ from 'lodash';

export const allStages = _.flatMap(STAGES, 'shortName');

interface Props {
  style: object;
}

export const StageFilter = (props: Props) => {
  const { style, ...restProps } = props;
  return (
    <MultiSelect
      {...restProps}
      label='Stage'
      placeholder='L2, L3'
      options={allStages.map(valueToOption)}
      style={{ ...style}}
    />
  );
};
