import React from 'react';
import { BorderWrapper, LeadProgressBox } from '@client/components';
import { Row, Col, Tooltip, Tag } from 'antd';
import moment from 'moment';
import { translate } from '@client/i18n';
import './styles.less';

interface State {}

interface Props {
  data: any;
  statuses: any;
  stages: any;
  changeInput: (payload: any) => void;
  updateLead: (payload: any) => Promise<void>;
}

export class LeadStage extends React.Component<Props, State> {
  changeStage = async (payload: string) => {
    this.props.changeInput({
      currentStage: payload,
      currentStatus: '',
      lastUpdatedStageAt: Date.now(),
      overdueStatusAt: undefined,
    });

    await this.props.updateLead({
      currentStage: payload,
      currentStatus: '',
      lastUpdatedStageAt: Date.now(),
    });
  }

  changeStatus = async (payload: string) => {
    const status = this.props.statuses.find((val: any) => val.value && val.value.name === payload);
    let overdueStatusAt: any;
    if (status && status.value && status.value.overdue) {
      overdueStatusAt = moment().add(status.value.overdue, 'days').valueOf();
    }

    this.props.changeInput({
      currentStatus: payload,
      lastUpdatedStageAt: Date.now(),
      overdueStatusAt,
    });

    await this.props.updateLead({
      currentStatus: payload,
      lastUpdatedStatusAt: Date.now(),
    });
  }

  render () {
    return (
      <BorderWrapper style={{marginTop: '24px'}}>
        <div>
          <Row style={{display: 'flex', alignItems: 'center'}}>
            <Col xs={12}>
              <h3>{translate('lang:leadStage')}</h3>
            </Col>
            <Col xs={12} style={{display: 'flex', justifyContent: 'flex-end'}}>
              {this.props.data.overdueStatusAt && this.props.data.overdueStatusAt < Date.now() ?
                <Tag color='red'>{translate('lang:overdue')}</Tag> : <div></div>
              }
            </Col>
          </Row>
          <Row>
            <Col xs={10}>
              <Tooltip title={this.props.data.lastUpdatedStageAt ? moment(this.props.data.lastUpdatedStageAt).format('DD MMM YYYY') : translate('lang:notYet')}>
                <p><span className='text-gray'>{translate('lang:lastStageChanged')}:</span> <span className={this.props.data.lastUpdatedStageAt ? '' : 'text-red'}>{this.props.data.lastUpdatedStageAt ?
                  moment().diff(moment(this.props.data.lastUpdatedStageAt).format('YYYY-MM-DD'), 'days') ?
                  moment().diff(moment(this.props.data.lastUpdatedStageAt).format('YYYY-MM-DD'), 'days') > 1 ?
                  moment().diff(moment(this.props.data.lastUpdatedStageAt).format('YYYY-MM-DD'), 'days') + ` ${translate('lang:days')}` :
                  moment().diff(moment(this.props.data.lastUpdatedStageAt).format('YYYY-MM-DD'), 'days') + ` ${translate('lang:day')}` :
                  translate('lang:today') : translate('lang:notYet')}</span></p>
              </Tooltip>
            </Col>
            <Col xs={12} offset={2}>
              <Tooltip title={this.props.data.lastUpdatedStatusAt ? moment(this.props.data.lastUpdatedStatusAt).format('DD MMM YYYY') : translate('lang:notYet')}>
                <p><span className='text-gray'>{translate('lang:lastStatusChanged')}:</span> <span className={this.props.data.lastUpdatedStatusAt ? '' : 'text-red'}>
                {this.props.data.lastUpdatedStatusAt ?
                  moment().diff(moment(this.props.data.lastUpdatedStatusAt).format('YYYY-MM-DD'), 'days') ?
                  moment().diff(moment(this.props.data.lastUpdatedStatusAt).format('YYYY-MM-DD'), 'days') > 1 ?
                  moment().diff(moment(this.props.data.lastUpdatedStatusAt).format('YYYY-MM-DD'), 'days') + ` ${translate('lang:days')}` :
                  moment().diff(moment(this.props.data.lastUpdatedStatusAt).format('YYYY-MM-DD'), 'days') + ` ${translate('lang:day')}` :
                  translate('lang:today') : translate('lang:notYet')}</span></p>
              </Tooltip>
            </Col>
            <Col xs={10}>
              <Tooltip title={this.props.data.lastContactedAt ? moment(this.props.data.lastContactedAt).format('DD MMM YYYY') : translate('lang:notContacted')}>
                <p>
                  <span className='text-gray'>{translate('lang:lastContacted')}:</span>
                  <span className={this.props.data.lastContactedAt ? '' : 'text-red'}>{this.props.data.lastContactedAt ?
                    moment().diff(moment(this.props.data.lastContactedAt).format('YYYY-MM-DD'), 'days') ?
                    moment().diff(moment(this.props.data.lastContactedAt).format('YYYY-MM-DD'), 'days') > 1 ?
                    moment().diff(moment(this.props.data.lastContactedAt).format('YYYY-MM-DD'), 'days') + ` ${translate('lang:days')}` :
                    moment().diff(moment(this.props.data.lastContactedAt).format('YYYY-MM-DD'), 'days') + ` ${translate('lang:day')}` :
                    translate('lang:today') : translate('lang:notContacted')}</span>
                </p>
              </Tooltip>
            </Col>
            <Col xs={12} offset={2}>
              <Tooltip title={moment(this.props.data.createdAt).format('DD MMM YYYY')}>
                <p><span className='text-gray'>{translate('lang:fromFirstCreated')}:</span> <span className='text-red'>
                  {moment().diff(moment(this.props.data.createdAt).format('YYYY-MM-DD'), 'days') ?
                  moment().diff(moment(this.props.data.createdAt).format('YYYY-MM-DD'), 'days') > 1 ?
                  moment().diff(moment(this.props.data.createdAt).format('YYYY-MM-DD'), 'days') + ` ${translate('lang:days')}` :
                  moment().diff(moment(this.props.data.createdAt).format('YYYY-MM-DD'), 'days') + ` ${translate('lang:day')}` :
                  translate('lang:today')}
                </span></p>
              </Tooltip>
            </Col>
            <Col xs={10}>
              <p><span className='text-gray'>{translate('lang:overdueStatusAt')}:</span> <span
                className={this.props.data.overdueStatusAt && this.props.data.overdueStatusAt < Date.now() ? 'text-red' : ''}>
              {this.props.data.overdueStatusAt ? moment(this.props.data.overdueStatusAt).format('DD/MM/YYYY') : translate('lang:notSet')}</span></p>
            </Col>
          </Row>

          <LeadProgressBox
            stage={this.props.data.currentStage}
            status={this.props.data.currentStatus}
            stages={this.props.stages}
            statuses={this.props.statuses}
            changeStage={this.changeStage}
            changeStatus={this.changeStatus}
          />
        </div>
      </BorderWrapper>
    );
  }
}
