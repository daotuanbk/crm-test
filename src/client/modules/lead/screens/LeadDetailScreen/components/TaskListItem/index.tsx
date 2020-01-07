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
import './styles.less';

interface State {}

interface Props {
  tasks: any[];
  onChangeStatus: (taskId: string) => void;
  openModal: (task: any) => void;
  placement?: any;
  title: string;
}

export class TaskListItem extends React.Component<Props, State> {
  generateTitle = (status: number) => {
    if (status === LEAD_TASK_STATUS_FINISHED) {
      return translate('lang:undoTaskConfirm');
    }
    return translate('lang:finishTaskConfirm');
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
    const { tasks, title } = this.props;

    if (!tasks || !tasks.length) {
      return null;
    }

    return (
      <div style={{ padding: '15px 0px 0px 0px' }}>
        <Row>
          <Col xs={24}>
            <h3>{title}</h3>
          </Col>
          <Col xs={24}>
            {tasks.map((task: any) => {
              const time = timeAgo(task[this.generateTime(task.status)]);
              const subtext = `${(task.assigneeId &&
                task.assigneeId.fullName) ||
                translate('lang:notAssignedYet')}, ${time}`;
              const tooltip = (
                <Tooltip
                  placement={'top'}
                  title={() => {
                    return (
                      <div style={{ padding: '8px' }}>
                        {task.title}
                        <br />
                        <div
                          onClick={() => {
                            this.props.openModal(task);
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
                  {task.title.split(' ').length > 10
                    ? task.title
                        .split(' ')
                        .slice(0, 10)
                        .join(' ') + '...'
                    : task.title}
                </Tooltip>
              );
              return (
                <CheckListItem
                  key={task._id}
                  lineThroughText={task.status === LEAD_TASK_STATUS_FINISHED}
                  color={this.generateColor(task.dueAt, task.finishAt)}
                  text={tooltip}
                  renderCheckbox={() => (
                    <Popconfirm
                      placement={this.props.placement || 'left'}
                      title={this.generateTitle(task.status)}
                      onConfirm={() => {
                        this.props.onChangeStatus(task._id);
                      }}
                      okText='Yes'
                      cancelText='No'
                    >
                      <span>
                        <Checkbox
                          checked={
                            task.status === LEAD_TASK_STATUS_FINISHED ||
                            !!task.checked
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
