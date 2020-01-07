import React, { Component } from 'react';
import { Button, Icon } from 'antd';
import { Centre } from '@client/services/service-proxies';
import _ from 'lodash';
import { Moment } from 'moment';
import { Nest } from '@client/helpers';
import { STAGES } from '@common/stages';

interface Props {
  onFitler: (filters: Filter) => void;
  centres: Centre [];
  owners: any [];
}

export interface Filter {
  stage: string[];
  status: string[];
  channel: string[];
  tuitionProgress: string | undefined;
  product: string | undefined;
  owner: string | undefined;
  centre: string | undefined;
  reminder: Moment[];
  appointment: Moment[];
  createdAt: Moment[];
  lmsCourse: string | undefined;
  lmsClass: string | undefined;
  lmsEnrollmentStatus: string | undefined;
}

interface State {
  filters: Filter;
}

const itemStyle = {
  marginRight: '1rem',
  marginBottom: '1rem',
};

type FilterChangeHook = (value: any, field: string) => any;
interface FilterConfig {
  render: (props: any) => JSX.Element;
  nest: Nest;
}

export const createLeadFilter = (hooks: FilterChangeHook[], filterConfigs: FilterConfig[], initialFilters: Filter) => {
  return class LeadFilter extends Component<Props, State> {
    state: State = {
      filters: initialFilters,
    };

    handleFilterChange = (filters: Filter, field: string) => {
      const filtersToSet = hooks.reduce(
        (prevFilters: any, hook: FilterChangeHook) => hook(prevFilters, field),
        filters,
      );
      this.setState(
        { filters: filtersToSet },
        () => this.props.onFitler(this.state.filters),
      );
    }

    clearFilter = () => {
      this.setState(
        { filters: initialFilters },
        () => this.props.onFitler(initialFilters),
      );
    }

    render() {
      const { centres, owners } = this.props;
      const { filters } = this.state;
      const rootInputProps = {
        value: filters,
        onChange: this.handleFilterChange,
        centres,
        owners,
      };
      return (
        <React.Fragment>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {
              filterConfigs.map((config: FilterConfig) => config.render(
                {
                  ...config.nest(rootInputProps),
                  style: itemStyle,
                  filters,
                },
              ))
            }
            <Button onClick={this.clearFilter} style={{ ...itemStyle }}>
              <Icon type='delete' theme='filled' />
              Clear filters
            </Button>
          </div>
        </React.Fragment>
      );
    }
  };
};

const statusToOption = (status: any) => ({
  display: status.name,
  value: status.shortName,
});

const allStatuses = _(STAGES)
  .flatMap('statuses')
  .value();

const allStatusesByStage = (stageShortNames: string[]) => {
  return stageShortNames.length === 0
    ? allStatuses
    : _(STAGES).mapKeys('shortName').pick(stageShortNames).flatMap('statuses').value();
};

export const statusOptionsFilterByStage: Nest = (parentProps) => {
  const { value: { stage } } = parentProps;
  return {
    options: allStatusesByStage(stage).map(statusToOption),
  };
};

export const statusValueFilterByStage = (value: any, _field: string) => {
  // Filter out only the status that belong the selected stages
  const statusToSet = _.intersection(allStatusesByStage(value.stage).map((s: any) => s.shortName), value.status);
  return {
    ...value,
    status: statusToSet,
  };
};

export const lmsClassClearedWhenLmsCourseChange = (value: any, _field: string) => {
  if (_field === 'lmsCourse') {
    return {
      ...value,
      lmsClass: undefined,
    };
  }
  return value;
};

export const createInitialFilters = (stage: [string]): Filter => {
  return {
    stage,
    status: [],
    channel: [],
    tuitionProgress: undefined,
    product: undefined,
    owner: undefined,
    centre: undefined,
    reminder: [],
    appointment: [],
    createdAt: [],
    lmsCourse: undefined,
    lmsClass: undefined,
    lmsEnrollmentStatus: undefined,
  };
};
