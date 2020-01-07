import React, { Fragment } from 'react';
import { Button, Icon, Input, Row, Col, AutoComplete, DatePicker } from 'antd';
import moment from 'moment';
import { MultiSelect } from '../MultiSelect/MultiSelect';
import './ToolbarWithSuggest.less';

interface ObjectCallback {
  search: string;
  sortBy?: string;
  filter?: any;
}

interface Props {
  name: string;
  filters?: {
    key: {
      label: string; value: string
    };
    value: {
      label: string; value: string
    };
  }[];
  disableFilter?: any;
  disableSearch?: any;
  disableSortBy?: any;
  saveFilterCallback?: () => void;
  sortData?: any[];
  style?: any;
  callback?: (data: ObjectCallback) => void;
  handleFilterChange?: (filter: {
    key: {
      label: string; value: string
    };
    value: {
      label: string; value: string
    };
  }) => void;
  autoCompleteSource?: any;
  searchAutoCompleteSource: (payload: string) => Promise<any>;
  selectFromAutocomplete: (payload: string) => void;
  isContact?: boolean;
  sortBy?: string;
  removeFilter?: (filter: {
    key: {
      label: string; value: string
    };
    value: {
      label: string; value: string
    };
  }) => void;
  saveSimpleFilterData?: (payload: any) => Promise<any>;
  stageOptions: any[];
  statusOptions: any[];
  sourceOptions: any[];
}

interface State {
  search: string;
  selected?: string;
  filterVisible: boolean;
  sortBy?: string;
  filter?: { label: string; value: string };
  filterValue?: { label: string; value: any };
  simpleFilters: {
    stage: any[],
    status: any[],
    source: any[],
    tuition: any[],
  };
  simpleFiltersTask: {
    startDate: string | undefined,
    endDate: string | undefined,
  };
  simpleFilterOptions: {
    stage: any[],
    status: any[],
    source: any[],
    tuition: any[],
  };
}
export class ToolbarWithSuggest extends React.Component<Props, State> {
  inputRef: React.RefObject<unknown>;

  constructor(props: Props) {
    super(props);
    this.state = {
      search: '',
      filterVisible: false,
      sortBy: undefined,
      filter: undefined,
      selected: undefined,
      simpleFilters: {
        stage: [],
        status: [],
        source: [],
        tuition: [],
      },
      simpleFilterOptions: {
        stage: [],
        status: [],
        source: [],
        tuition: [],
      },
      simpleFiltersTask: {
        startDate: undefined,
        endDate: undefined,
      },
    };
    this.inputRef = React.createRef();
  }

  addFilter = () => {
    if (this.props.handleFilterChange) {
      this.props.handleFilterChange({
        label: this.state.filter,
        value: this.state.filterValue,
      } as any);

      this.setState({
        filter: undefined,
        filterValue: undefined,
        filterVisible: false,
      });
    }
  }

  renderSuggestion = (data: any) => {
    return data && data.length ? data.map((val: any) => {
      if (!this.props.isContact) {
        const fullName = val.contact ? val.contact.fullName || ((val.contact.lastName ? val.contact.lastName : '') +
          (val.contact.lastName ? ' ' : '') + (val.contact.firstName ? val.contact.firstName : '')) : '';
        const course = val.productOrder && val.productOrder.courses && val.productOrder.courses.length ? val.productOrder.courses[val.productOrder.courses.length - 1].name : '';
        const combo = val.productOrder && val.productOrder.comboName ? val.productOrder.comboName : '';
        const phone = val.contact && val.contact.phone ? val.contact.phone : '';
        const email = val.contact && val.contact.email ? val.contact.email : '';
        const text = (fullName ? `${fullName}` : '') + (combo ? ` - ${combo}` : '') + (course ? ` - ${course}` : '') + (phone ? ` - ${phone}` : '') + (email ? ` - ${email}` : '');
        return {
          value: val._id,
          text,
        };
      } else {
        const fullName = val.contactBasicInfo ? val.contactBasicInfo.fullName || ((val.contactBasicInfo.lastName ? val.contactBasicInfo.lastName : '') +
          (val.contactBasicInfo.lastName ? ' ' : '') + (val.contactBasicInfo.firstName ? val.contactBasicInfo.firstName : '')) : '';
        const phone = val.contactBasicInfo && val.contactBasicInfo.phone ? val.contactBasicInfo.phone : '';
        const email = val.contactBasicInfo && val.contactBasicInfo.email ? val.contactBasicInfo.email : '';
        const text = (fullName ? `${fullName}` : '') + (phone ? ` - ${phone}` : '') + (email ? ` - ${email}` : '');
        return {
          value: val._id,
          text,
        };
      }
    }) : [];
  }

  changeDate = (field: string, date: any) => {
    let d = date;
    if (field === '$gte') {
      d = moment(date).startOf('day');
    } else {
      d = moment(date).endOf('day');
    }
    this.setState({
      filterValue: {
        label: 'createdAt',
        value: this.state.filterValue && this.state.filterValue.value ? {
          ...this.state.filterValue.value,
          [field]: moment(d).valueOf(),
        } : {
            [field]: moment(d).valueOf(),
          },
      },
    });
  }

  updateSimpleFilter = async () => {
    const simpleFiltersArr: any = [
      { stage: this.state.simpleFilters.stage },
      { status: this.state.simpleFilters.status },
      { source: this.state.simpleFilters.source },
      { tuition: this.state.simpleFilters.tuition },
      {
        startDate: this.state.simpleFiltersTask.startDate,
        endDate: this.state.simpleFiltersTask.endDate,
      },
    ];
    const { saveSimpleFilterData } = this.props;
    saveSimpleFilterData!(simpleFiltersArr);
  }
  removeSimpleFilter = async () => {
    this.setState({
      simpleFilters: {
        stage: [],
        status: [],
        source: [],
        tuition: [],
      },
      simpleFiltersTask: {
        startDate: undefined,
        endDate: undefined,
      },
    }, () => {
      this.updateSimpleFilter();
    });
  }

  handleOnDateChange = (dates: any, _datesString: any) => {
    if (dates[0] === undefined || dates[1] === undefined) {
      this.setState({
        simpleFiltersTask: {
          startDate: undefined,
          endDate: undefined,
        },
      }, () => {
        this.updateSimpleFilter();
      });
    } else {
      const startDate = dates[0]._d.toISOString();
      const endDate = dates[1]._d.toISOString();
      this.setState({
        simpleFiltersTask: {
          startDate,
          endDate,
        },
      }, () => {
        this.updateSimpleFilter();
      });
    }
  }

  render() {
    const { disableSearch } = this.props;
    const defaultStyle = { width: '100%', display: 'flex', flexDirection: 'row' };
    let timeout = undefined as any;
    return (
      <Fragment>
        <Row style={{ width: '100%' }}>
          <Col xs={16} style={{ display: 'flex', alignItems: 'center' }}>
            {!disableSearch ?
              <div style={{ width: '100%' }}>
                <AutoComplete style={{ width: '100%', borderRadius: '0px' }} placeholder={`Search ${this.props.name}`} dropdownClassName='custom-autocomplete'
                  dataSource={this.renderSuggestion(this.props.autoCompleteSource || [])}
                  defaultActiveFirstOption={false}
                  onChange={(val: any) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                      this.props.searchAutoCompleteSource(val);
                    }, 500);
                  }}
                  onSelect={(val: any) => {
                    this.setState({
                      selected: val,
                    });
                    this.props.selectFromAutocomplete(val);
                  }}
                  ref={this.inputRef as any}
                >
                  <Input.Search
                    style={{ borderRadius: '0px' }}
                    addonAfter={this.props.saveFilterCallback && (
                      <a onClick={this.props.saveFilterCallback}><Icon type='save' /> Save filter</a>
                    )}
                    onSearch={(val: any) => {
                      setTimeout(() => {
                        if (this.state.selected) {
                          this.setState({
                            selected: undefined,
                          });
                        } else {
                          this.setState({
                            ...this.state,
                            search: val,
                            selected: undefined,
                          }, () => {
                            if (this.props.callback) {
                              this.props.callback(this.state);
                              (this.inputRef as any).current.blur();
                            }
                          });
                        }
                      }, 0);
                    }}></Input.Search>
                </AutoComplete>
              </div> : <div></div>
            }
          </Col>
        </Row>
        <Row className='custom-row' style={{ ...defaultStyle, ...(this.props.style ? this.props.style : {}) }}>
          {this.props.name === 'leads' && (
            <Fragment>
              <Col xs={{ span: 3 }} className='custom-col'>
                <MultiSelect
                  options={this.props.stageOptions}
                  placeholder='Stage'
                  valueField='value'
                  labelField='label'
                  filter={this.state.simpleFilters.stage}
                  onFilterChange={(newValue: any) => {
                    const { status, source, tuition } = this.state.simpleFilters;
                    this.setState({
                      simpleFilters: {
                        status: [...status],
                        stage: [...newValue],
                        source: [...source],
                        tuition: [...tuition],
                      },
                    }, () => {
                      this.updateSimpleFilter();
                    });
                  }}
                ></MultiSelect>
              </Col>
              <Col xs={{ span: 3 }} className='custom-col'>
                <MultiSelect
                  options={this.props.statusOptions}
                  placeholder='Status'
                  valueField='value'
                  labelField='label'
                  filter={this.state.simpleFilters.status}
                  onFilterChange={(newValue: any) => {
                    const { stage, source, tuition } = this.state.simpleFilters;
                    this.setState({
                      simpleFilters: {
                        status: [...newValue],
                        stage: [...stage],
                        source: [...source],
                        tuition: [...tuition],
                      },
                    }, () => {
                      this.updateSimpleFilter();
                    });
                  }}
                ></MultiSelect>
              </Col>
              <Col xs={{ span: 3 }} className='custom-col'>
                <MultiSelect
                  options={this.props.sourceOptions}
                  placeholder='Source'
                  valueField='value'
                  labelField='label'
                  filter={this.state.simpleFilters.source}
                  onFilterChange={(newValue: any) => {
                    const { stage, status, tuition } = this.state.simpleFilters;
                    this.setState({
                      simpleFilters: {
                        status: [...status],
                        stage: [...stage],
                        source: [...newValue],
                        tuition: [...tuition],
                      },
                    }, () => {
                      this.updateSimpleFilter();
                    });
                  }}
                ></MultiSelect>
              </Col>
              <Col xs={{ span: 3 }} className='custom-col'>
                <MultiSelect
                  options={[
                    {
                      label: '0%',
                      value: '0',
                    },
                    {
                      label: '0%-100%',
                      value: '0:100',
                    },
                    {
                      label: '100%',
                      value: '100',
                    },
                  ]}
                  placeholder='Tuition'
                  valueField='value'
                  labelField='label'
                  filter={this.state.simpleFilters.tuition}
                  onFilterChange={(newValue: any) => {
                    const { simpleFilters } = this.state;
                    this.setState({
                      simpleFilters: {
                        ...simpleFilters,
                        tuition: [...newValue],
                      },
                    }, () => {
                      this.updateSimpleFilter();
                    });
                  }}
                ></MultiSelect>
              </Col>
              <Col xs={{ span: 4 }} className='custom-col'>
                <div style={{ marginTop: '10px' }}>
                  <h6 style={{ fontSize: '16px', fontWeight: 'normal', marginBottom: '8px' }}>Reminders</h6>
                  <div>
                    <DatePicker.RangePicker
                      size='default'
                      onChange={this.handleOnDateChange}
                      value={
                        this.state.simpleFiltersTask.startDate ? [moment(this.state.simpleFiltersTask.startDate), moment(this.state.simpleFiltersTask.endDate)] : []
                      }
                    />
                  </div>
                </div>
              </Col>
            </Fragment>
          )}
          <Col style={{ marginTop: '42px', display: 'flex', flexDirection: 'row' }} xs={{ span: 7 }} className={this.props.name === 'leads' ? 'advanced-filter' : ''}>
            <Button onClick={this.removeSimpleFilter}>Clear filters</Button>
          </Col>
        </Row>
      </Fragment>
    );
  }
}
