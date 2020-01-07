import { STAGES } from '@common/stages';
import { SOURCES } from '@common/sources';
import _ from 'lodash';

export const allStages = _.flatMap(STAGES, 'shortName');

export const allStatusesByStage = (stageShortNames: string[]) => {
  return stageShortNames.length === 0
  ? allStatuses
  : _(STAGES).mapKeys('shortName').pick(stageShortNames).flatMap('statuses').map('shortName').value();
};

export const allSources = SOURCES;

export const allTuitions = [
  {
    display: '0%',
    value: '0',
  },
  {
    display: '0-100%',
    value: '0:100',
  },
  {
    display: '100%',
    value: '100',
  },
];

const allStatuses = _(STAGES).flatMap('statuses').map('shortName').value();
