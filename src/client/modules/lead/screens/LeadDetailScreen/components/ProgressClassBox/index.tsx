import React from 'react';
import { Row, Col, Select, DatePicker, TimePicker, Button, Spin, message } from 'antd';
import moment from 'moment';
import './styles.less';

interface State {
  loading: boolean;
  colLoading: string;
}

interface Props {
  readOnly?: boolean;
  stage?: string;
  status?: string;
  stages: any;
  arrangedAt?: number;
  statuses: any;
  centre: any;
  changeArrangedAt?: (payload: number) => Promise<void>;
  changeStatus: (payload: string) => Promise<void>;
  changePropStage: (payload: string) => void;
  changeStage: (payload: string, sendAutoMail?: boolean) => Promise<void>;
}

export class ProgressClassBox extends React.Component<Props, State> {
  arrangedDay = moment();

  arrangedHour = moment();

  state: State = {
    loading: false,
    colLoading: '',
  };

  getArrangedAt = () => {
    const arrangedAt = moment([this.arrangedDay.year(), this.arrangedDay.month(), this.arrangedDay.date(),
    this.arrangedHour.hour(), this.arrangedHour.minute(), this.arrangedHour.second()]).valueOf();
    return arrangedAt;
  };

  onChangeArrangedAt = async () => {
    const arrangedAt = this.getArrangedAt();
    if (arrangedAt) {
      // @ts-ignore
      await this.props.changeArrangedAt(arrangedAt);
    }
  };

  saveArrangeAndStage = async () => {
    if (this.props.stage === 'Arranged') {
      if (this.props.centre) {
        await Promise.all([
          this.onChangeArrangedAt(),
          this.props.changeStage(this.props.stage as any, true),
        ]);
      } else {
        message.warning('You must add a centre first!');
      }
    }
  }

  renderArrangedAt = (stage?: string) => {
    if (stage === 'Arranged') {
      if (this.props.readOnly && !this.props.arrangedAt) return <div>No arranged time</div>;
      return (
        <div>
          <DatePicker
            disabled={this.props.readOnly}
            defaultValue={this.props.arrangedAt ? moment(this.props.arrangedAt) : moment(new Date()) as any}
            disabledDate={(endValue: any) => {
              return endValue.valueOf() < moment().valueOf() - 3600000 * 24;
            }}
            style={{ marginBottom: '5px', width: '100%' }}
            format={'DD-MM-YYYY'}
            allowClear={false}
            onChange={(day) => {
              this.arrangedDay = day;
            }}
            placeholder='Select day'
          />
          <TimePicker
            disabled={this.props.readOnly}
            defaultValue={this.props.arrangedAt ? moment(this.props.arrangedAt) : moment(new Date()) as any}
            allowEmpty={false}
            style={{ width: '100%' }}
            format={'HH:mm'}
            onChange={(hour) => {
              this.arrangedHour = hour;
            }}
            />
          { this.props.readOnly ? <div></div> : <Button type='primary' loading={this.state.loading} style={{marginTop: '5px', float: 'right'}} onClick={this.saveArrangeAndStage}>Save</Button> }
        </div>
      );
    }
    return null;
  };

  renderPointerClassName = (stage: string) => {
    if (!this.props.readOnly) return '';
    if (stage === 'Arranged' || stage === 'Tested') return '';
    return 'default-pointer';
  };

  render() {
    const stages = this.props.stages ? this.props.stages.sort((a: any, b: any) => a.order - b.order) : [];
    return (
      <Row type='flex'>
        {this.props.stages ? stages.map((val: any, index: number) => {
          const statuses = this.props.statuses ? this.props.statuses.filter((status: any) => {
            return status && status.value && status.value.stageId === val._id;
          }).sort((a: any, b: any) => a.order - b.order) : [];
          const lastStatus = statuses.length ? statuses[statuses.length - 1].value.name : '';
          const currentIndex = this.props.stages.reduce((result: number, v: any, i: number) =>
            v && v.value && v.value.name === this.props.stage ? i : result, 0);

          return val && val.value && val.value.name === this.props.stage ?
            <Col xs={6} className={`custom-color-select-box stage-class-${index + 1} ${this.renderPointerClassName(val.value.name)}`}>
              <Spin spinning={false} wrapperClassName='spin-container'>
                <h3>{this.props.stage}</h3>
                {this.renderArrangedAt(this.props.stage)}
                {statuses.length ? <Select value={this.props.status} placeholder='Select status' defaultOpen={!this.props.readOnly && !this.props.status}
                  onChange={async (value) => {
                    this.setState({
                      colLoading: val.value.name,
                    });
                    await this.props.changeStatus(value);
                    this.setState({
                      colLoading: '',
                    });
                  }} style={{ color: '#eee', width: '100%' }}>
                  {
                    statuses.sort((a: any, b: any) => a.value.order - b.value.order).map((status: any) => {
                      return status && status.value ? <Select.Option style={{ background: 'transparent' }} value={status.value.name} key={status._id}>{status.value.name}</Select.Option> : undefined;
                    })
                  }
                </Select> : <div></div>
                }
              </Spin>
            </Col> :
            index < currentIndex ?
              <Col xs={6} className={`custom-color-select-box stage-class-${index + 1} ${this.renderPointerClassName(val.value.name)}`} onClick={async () => {
                this.setState({
                  colLoading: val.value.name,
                });
                const stage = val.value.name;
                if (this.props.readOnly) {
                  if (stage === 'Tested' || stage === 'Arranged') {
                    this.props.changeStage(stage);
                  }
                  return;
                }
                if (stage !== 'Arranged') {
                  await this.props.changeStage(stage);
                } else {
                  this.props.changePropStage(stage);
                }
                this.setState({
                  colLoading: '',
                });
              }}>
                <Spin spinning={false} wrapperClassName='spin-container'>
                  <h3>{val.value.name}</h3>
                  <h4>{lastStatus}</h4>
                </Spin>
              </Col> :
              <Col xs={6} className={`custom-color-select-box stage-class-${index + 1} stage-default ${this.renderPointerClassName(val.value.name)}`} onClick={async () => {
                const stage = val.value.name;
                this.setState({
                  colLoading: val.value.name,
                });
                if (this.props.readOnly) {
                  if (stage === 'Tested') this.props.changeStage(stage);
                  return;
                }
                if (stage !== 'Arranged') {
                  await this.props.changeStage(stage);
                } else {
                  this.props.changePropStage(stage);
                }
                this.setState({
                  colLoading: '',
                });
              }}
              >
                <Spin spinning={false} wrapperClassName='spin-container'>
                  <h3>{val.value.name}</h3>
                  <h4></h4>
                </Spin>
              </Col>;
        }) : null}
      </Row>
    );
  }
}
