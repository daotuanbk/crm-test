import React from 'react';
import { CheckListItem } from '@client/components';
import { Row, Col, Popconfirm, Checkbox, Tooltip } from 'antd';
import {
  LEAD_TASK_STATUS_FINISHED,
  LEAD_TASK_STATUS_UNFINISHED,
  timeAgo,
} from '@client/core';
import moment from 'moment';
import { translate } from '@client/i18n';
import { LeadAppointment as LeadAppointmentSchema } from '@client/services/service-proxies';
import './styles.less';

interface LeadAppointment extends LeadAppointmentSchema {
  checked: boolean;
}

interface State {}

interface Props {
  appointments: LeadAppointment[];
  onChangeStatus: (appointmentId: string) => void;
  openModal: (appointment: LeadAppointment) => void;
  placement?: any;
  title: string;
}

export class AppointmentListItem extends React.Component<Props, State> {
  generateTitle = (status: number) => {
    if (status === LEAD_TASK_STATUS_FINISHED) {
      return translate('lang:undoAppointmentConfirm');
    }
    return translate('lang:finishAppointmentConfirm');
  };

  generateColor = (dueAt: number, finishAt: number) => {
    if (!finishAt) {
      if (dueAt >= moment().valueOf()) {
        return 'blue';
      } else {
        return 'red';
      }
    } else {
      if (dueAt >= finishAt) {
        return 'blue';
      } else {
        return 'red';
      }
    }
  };

  generateTime = (status: number) => {
    if (status === LEAD_TASK_STATUS_UNFINISHED) {
      return 'dueAt';
    }
    return 'finishedAt';
  };

  render() {
    const { appointments, title } = this.props;

    if (!appointments || !appointments.length) {
      return null;
    }

    return (
      <div style={{ padding: '15px 0px 0px 0px' }}>
        <Row>
          <Col xs={24}>
            <h3>{title}</h3>
          </Col>
          <Col xs={24}>
            {appointments.map((appointment: LeadAppointment) => {
              const time = timeAgo(
                appointment[this.generateTime(appointment.status)],
              );
              const subtext = `${(appointment.assigneeId &&
                (appointment.assigneeId as any).fullName) ||
                'Not assigned'}, ${time}`;
              const tooltip = (
                <Tooltip
                  placement={'top'}
                  title={() => {
                    return (
                      <div style={{ padding: '8px' }}>
                        {appointment.title}
                        <br />
                        <div
                          onClick={() => {
                            this.props.openModal(appointment);
                          }}
                          style={{
                            cursor: 'pointer',
                            textAlign: 'right',
                            color: '#dddddd',
                            fontSize: '14px',
                          }}
                        >
                          {translate('lang:clickToEditDelete')}
                        </div>
                      </div>
                    );
                  }}
                >
                  {appointment.title.split(' ').length > 10
                    ? appointment.title
                        .split(' ')
                        .slice(0, 10)
                        .join(' ') + '...'
                    : appointment.title}
                </Tooltip>
              );
              return (
                <CheckListItem
                  key={appointment.id}
                  lineThroughText={
                    appointment.status === LEAD_TASK_STATUS_FINISHED
                  }
                  color={this.generateColor(
                    appointment.dueAt,
                    appointment.finishedAt,
                  )}
                  text={tooltip}
                  renderCheckbox={() => (
                    <Popconfirm
                      placement={this.props.placement || 'left'}
                      title={this.generateTitle(appointment.status)}
                      onConfirm={() => {
                        this.props.onChangeStatus(appointment.id);
                      }}
                      okText='Yes'
                      cancelText='No'
                    >
                      <span>
                        <Checkbox
                          checked={
                            appointment.status === LEAD_TASK_STATUS_FINISHED ||
                            !!(appointment as any).checked
                          }
                        />
                      </span>
                    </Popconfirm>
                  )}
                  subtext={subtext}
                />
              );
            })}
          </Col>
        </Row>
      </div>
    );
  }
}
