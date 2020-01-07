import React from 'react';
import { Select, Popover, Button, Icon, Input, Row, Col } from 'antd';

interface ObjectCallback {
  search: string;
  sortBy?: string;
  filter?: any;
}

interface Props {
  name: string;
  data: any;
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
  sortData?: any;
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
}

interface State {
  search: string;
  filterVisible: boolean;
  sortBy?: string;
  filter?: { label: string; value: string };
  filterValue?: { label: string; value: string };
}

export class Toolbar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      search: '',
      filterVisible: false,
      sortBy: undefined,
      filter: undefined,
    };
  }

  addFilter = () => {
    if (this.props.handleFilterChange) {
      this.props.handleFilterChange({
        key: this.state.filter!,
        value: this.state.filterValue!,
      });

      this.setState({
        filter: undefined,
        filterValue: undefined,
        filterVisible: false,
      });
    }
  }

  render() {
    const selectedFilter = this.state.filter ? this.props.data.filter((item: any) => item.value === this.state.filter!.value)[0] : undefined;
    const dropdownFilter = (
      <div style={{ width: '100%' }}>
        <p style={{ margin: '5px' }}>Show all {this.props.name} where:</p>
        <Select
          value={this.state.filter ? this.state.filter.value : undefined}
          style={{ width: '100%' }}
          onSelect={(value: string, option: any) => this.setState({ filter: { label: option.props.children, value } })}
        >
          {this.props.data.map((val: any, index: number) => {
            return (
              <Select.Option value={val.value} key={index.toString()}>
                {val.label}
              </Select.Option>
            );
          })}
        </Select>
        <p style={{ margin: '5px' }}>is</p>
        <Select
          value={this.state.filterValue ? this.state.filterValue.value : undefined}
          style={{ width: '100%' }}
          onSelect={(value: string, option: any) => this.setState({
            filterValue: { label: option.props.children, value },
          })}
        >
          {selectedFilter && selectedFilter.children.map((item: any, index: number) => (
            <Select.Option value={item.value} key={index.toString()}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
        <div style={{ marginTop: '10px', textAlign: 'right' }}>
          <Button disabled={!(this.state.filter && this.state.filterValue)} type='primary' onClick={this.addFilter}>Add filter</Button>
        </div>
      </div>
    );
    const { disableFilter, disableSearch } = this.props;
    const defaultStyle = { width: '100%', display: 'flex', justifyContent: 'flex-end' };

    return (
      <Row style={{ ...defaultStyle, ...(this.props.style ? this.props.style : {}) }}>
        <Col xs={16} style={{ display: 'flex', alignItems: 'center' }}>
          {!disableFilter ?
            <div>
              <Popover
                visible={this.state.filterVisible}
                content={dropdownFilter}
                trigger='click'
                placement='bottom'
                onVisibleChange={() => this.setState({ filterVisible: !this.state.filterVisible })}
              >
                <Button style={{ borderRadius: '0px' }} onClick={() => this.setState({ filterVisible: true })}>Filter <Icon type='down'></Icon></Button>
              </Popover>
            </div> : <div></div>
          }
          {!disableSearch ?
            <div style={{ width: '100%' }}>
              <Input.Search style={{ width: '100%', borderRadius: '0px' }} placeholder={`Search ${this.props.name}`}
                addonAfter={this.props.saveFilterCallback && (
                  <a onClick={this.props.saveFilterCallback}><Icon type='save' /> Save filter</a>
                )}
                onSearch={(val: string) => {
                  this.setState({
                    ...this.state,
                    search: val,
                  }, () => {
                    if (this.props.callback) {
                      this.props.callback(this.state);
                    }
                  });
                }}></Input.Search>
            </div> : <div></div>
          }
        </Col>
        <Col xs={8}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <span>Sort By</span>
            <Select
              style={{ minWidth: '200px', marginLeft: '10px' }}
              defaultValue={this.props.sortData && this.props.sortData[0] ? this.props.sortData[0].value : undefined}
              onChange={(val: any) => {
                this.setState({
                  ...this.state,
                  sortBy: val,
                }, () => {
                  if (this.props.callback) {
                    this.props.callback(this.state);
                  }
                });
              }}>
              {this.props.sortData && this.props.sortData.map((val: any, index: number) => {
                return <Select.Option value={val.value} key={index.toString()}>{val.label}</Select.Option>;
              })}
            </Select>
          </div>
        </Col>
      </Row>
    );
  }

}
